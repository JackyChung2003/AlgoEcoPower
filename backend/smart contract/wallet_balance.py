from pyteal import *
import marketPlace

# Define token IDs
currency_token = Bytes("currency")  # Currency token ID
energy_token = Bytes("energy")  # Energy token ID
energy_upload = Bytes("energy_upload")  # Energy uploaded by user
energy_purchase = Bytes("energy_purchase")  # Total energy(included energy purchases)

# Maximum energy tokens allowed for each user
max_energy_tokens = Int(2000)

router = Router(
    "Wallet",
    BareCallActions(
        no_op=OnCompleteAction.create_only(Approve()),
        opt_in=OnCompleteAction.call_only(Approve()),
        close_out=OnCompleteAction.call_only(Approve()),
    ),
    clear_state=Approve(),
)


@router.method
def initialize_wallet():
    # Initialize the user's wallet with currency and energy tokens (if not already initialized)
    wallet_initialized = App.localGet(Txn.sender(), currency_token) != Int(0)
    handle_creation = Seq(
        [
            If(Not(wallet_initialized)).Then(
                App.localPut(
                    Txn.sender(), currency_token, Int(10)
                ),  # Initialize user's currency balance
                App.localPut(
                    Txn.sender(), energy_token, Int(0)
                ),  # Initialize user's energy balance
                App.localPut(
                    Txn.sender(), energy_upload, Int(0)
                ),  # Initialize user's energy upload
                App.localPut(
                    Txn.sender(), energy_purchase, Int(0)
                ),  # Initialize user's energy purchase
            ),
        ]
    )
    return handle_creation


# setting energy threshold
@router.method
def set_energy_threshold(threshold: abi.Uint64):
    # always check if energy_token exceeds threshold
    scratchCount = ScratchVar(TealType.uint64)
    return Seq(
        scratchCount.store(App.localGet(Txn.sender(), energy_token)),
        If(scratchCount.load() >= threshold.get()).Then(
            marketPlace.uploadEnergy((scratchCount.load() - threshold.get()))
        ),
        Approve(),
    )


if __name__ == "__main__":
    import os
    import json

    path = os.path.dirname(os.path.abspath(__file__))
    approval, clear, contract = router.compile_program(version=8)

    # Specify the directory path
    directory_path = os.path.join(path, "artifacts")

    # Create the directory if it doesn't exist
    if not os.path.exists(directory_path):
        os.makedirs(directory_path)

    # Dump out the contract as json that can be read in by any of the SDKs
    with open(os.path.join(path, "artifacts/contract.json"), "w") as f:
        f.write(json.dumps(contract.dictify(), indent=2))

    # Write out the approval and clear programs
    with open(os.path.join(path, "artifacts/approval.teal"), "w") as f:
        f.write(approval)

    with open(os.path.join(path, "artifacts/clear.teal"), "w") as f:
        f.write(clear)
