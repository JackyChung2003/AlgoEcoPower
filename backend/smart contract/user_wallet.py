from pyteal import *

# Define token IDs
currency_token = Bytes("currency")  # Currency token ID
energy_token = Bytes("energy")  # Energy token ID
energy_upload = Bytes("energy_upload")  # Energy uploaded by user
energy_purchase = Bytes("energy_purchase")  # Total energy (including energy purchases)

# Maximum energy tokens allowed for each user
max_energy_tokens = Int(2000)

energy_exceed_to_be_sold = Bytes("energy_exceed_to_be_sold")

router = Router(
    "User Wallet",
    BareCallActions(
        no_op=OnCompleteAction.create_only(Approve()),
        opt_in=OnCompleteAction.call_only(Approve()),
        close_out=OnCompleteAction.call_only(Approve()),
    ),
    clear_state=Approve(),
)


# Define initialize_wallet function from wallet_balance.py
@router.method
def initialize_wallet():
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


# Define uploadEnergy function
@router.method
def uploadEnergy(amount_upload: abi.Uint64):
    return Seq(
        # minus the amount of energy uploaded from the user's energy token
        decreseEnergyBalanceAmount(amount_upload),
        # add the amount of energy uploaded to the user's energy upload
        addEnergyUploadAmount(amount_upload),
        Approve(),
    )


# Define deleteUploadEnergy function
@router.method
def deleteUploadEnergy(amount_purchase: abi.Uint64):
    scratchCount = ScratchVar(TealType.uint64)
    return Seq(
        scratchCount.store(App.localGet(Txn.sender(), energy_upload)),
        Assert(scratchCount.load() >= amount_purchase.get()),
        # minus the amount of energy purchased from the user's energy upload
        decreaseEnergyUpload(amount_purchase),
        Approve(),
    )


# Define readEnergyUpload function from marketPlace.py
@router.method
def readEnergyUpload(*, output: abi.Uint64):
    return output.set(App.localGet(Txn.sender(), energy_upload))


# Define set_energy_threshold function from wallet_balance.py
@router.method
def set_energy_threshold(threshold: abi.Uint64):
    scratchCount = ScratchVar(TealType.uint64)
    ret = Seq(
        scratchCount.store(App.localGet(Txn.sender(), energy_token)),
        If(scratchCount.load() >= threshold.get()).Then(
            App.localPut(
                Txn.sender(),
                Bytes("energy_exceed_to_be_sold"),
                scratchCount.load() - threshold.get(),
            ),
            uploadExceedEnergy(),
        ),
        Approve(),
    )
    return ret


@router.method
def uploadExceedEnergy():
    # minus the threshold from the user's energy token
    decreseEnergyBalance(),
    # add the threshold to the user's energy upload
    addEnergyUpload(),
    # make the exceed energy back to 0
    App.localPut(Txn.sender(), energy_exceed_to_be_sold, Int(0)),
    return Approve()  # Add a return statement here


# @router.method
# def findExceedEnergy(threshold: abi.Uint64):
#    # use while loop to find the exceed energy
#    normalEnergy = ScratchVar(TealType.uint64)
#    exceedEnergy = ScratchVar(TealType.uint64)
#
#    ret = Seq(
#        normalEnergy.store(App.localGet(Txn.sender(), energy_token)),
#        exceedEnergy.store(Int(0)),
#        While(exceedEnergy.load() <= threshold.get()).Do(
#            exceedEnergy.store(exceedEnergy.load() + Int(1)),
#            normalEnergy.store(normalEnergy.load() - Int(1)),
#        ),
#        # minus the threshold from the user's energy token
#        decreseEnergyBalance(exceedEnergy),
#        # add the threshold to the user's energy upload
#        addEnergyUpload(exceedEnergy),
#        Approve(),
#    )


@router.method
def decreseEnergyBalanceAmount(amount_upload: abi.Uint64):
    scratchCount = ScratchVar(TealType.uint64)
    return Seq(
        scratchCount.store(App.localGet(Txn.sender(), energy_token)),
        App.localPut(
            Txn.sender(),
            energy_token,
            scratchCount.load() - amount_upload.get(),
        ),
    )


@router.method
def addEnergyUploadAmount(amount_upload: abi.Uint64):
    scratchCount = ScratchVar(TealType.uint64)
    return Seq(
        scratchCount.store(App.localGet(Txn.sender(), energy_upload)),
        App.localPut(
            Txn.sender(),
            energy_upload,
            scratchCount.load() + amount_upload.get(),
        ),
    )


@router.method
def decreseEnergyBalance():
    scratchCount = ScratchVar(TealType.uint64)
    energy_exceed = ScratchVar(TealType.uint64)
    return Seq(
        scratchCount.store(App.localGet(Txn.sender(), energy_token)),
        energy_exceed.store(App.localGet(Txn.sender(), energy_exceed_to_be_sold)),
        App.localPut(
            Txn.sender(),
            energy_token,
            scratchCount.load() - energy_exceed.load(),
        ),
    )


@router.method
def getEnergyUpload(*, output: abi.Uint64):
    return output.set(App.localGet(Txn.sender(), energy_upload))


@router.method
def addEnergyUpload():
    scratchCount = ScratchVar(TealType.uint64)
    energy_exceed = ScratchVar(TealType.uint64)
    return Seq(
        scratchCount.store(App.localGet(Txn.sender(), energy_upload)),
        energy_exceed.store(App.localGet(Txn.sender(), energy_exceed_to_be_sold)),
        App.localPut(
            Txn.sender(), energy_upload, scratchCount.load() + energy_exceed.load()
        ),
    )


@router.method
def decreaseEnergyUpload(amount_to_be_deleted: abi.Uint64):
    scratchCount = ScratchVar(TealType.uint64)
    return Seq(
        scratchCount.store(App.localGet(Txn.sender(), energy_upload)),
        App.localPut(
            Txn.sender(),
            energy_upload,
            scratchCount.load() - amount_to_be_deleted.get(),
        ),
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
