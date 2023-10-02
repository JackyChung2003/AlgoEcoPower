from pyteal import *

# Define token IDs
currency_token = Bytes("currency")  # Currency token ID
energy_token = Bytes("energy")  # Energy token ID
energy_upload = Bytes("energy_upload")  # Energy uploaded by user

router = Router(
    "Marketplace",
    BareCallActions(
        no_op=OnCompleteAction.create_only(Approve()),
        opt_in=OnCompleteAction.call_only(Approve()),
        close_out=OnCompleteAction.call_only(Approve()),
    ),
    clear_state=Approve(),
)


@router.method
def uploadEnergy(amount_upload: abi.Uint64):
    return Seq(
        App.localPut(
            Txn.sender(),
            Bytes("energy_upload"),
            (App.localGet(Txn.sender(), Bytes("energy_upload")) + amount_upload.get()),
        ),
        Approve(),
    )


@router.method
def deleteUploadEnergy(amount_purchase: abi.Uint64):
    scratchCount = ScratchVar(TealType.uint64)
    return Seq(
        scratchCount.store(App.localGet(Txn.sender(), Bytes("energy_upload"))),
        Assert(scratchCount.load() >= (amount_purchase.get())),
        App.localPut(
            Txn.sender(),
            Bytes("energy_upload"),
            (scratchCount.load() - amount_purchase.get()),
        ),
        Approve(),
    )


@router.method
def readEenrgyUpload(*, output: abi.Uint64):
    return output.set(App.localGet(Txn.sender(), Bytes("energy_upload")))


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
