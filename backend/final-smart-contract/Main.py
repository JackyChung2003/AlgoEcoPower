#updatedContract.py
# This file based on the counter app from the Algorand documentation - https://developer.algorand.org/docs/get-details/dapps/pyteal/#final-product
from pyteal import *

"""Modified Counter Application"""

CURRENCY = Bytes("amount")                  # Local variable to keep track of amount of currency owned by account
ENERGY = Bytes("energy")                    # Local variable to keep track of energy owned by account
ENERGY_PURCHASE = Bytes("energy_purchase")  # Global variable to keep track of energy purchases
ENERGY_UPLOAD = Bytes("energy_upload")      # Global variable to keep track of energy uploads
ENERGY_MARKET = Bytes("energy_market")      # Global variable to keep track of energy market



def approval_program():
    handle_creation = Seq([
        App.globalPut(ENERGY_MARKET, Int(1000)),
        Return(Int(1))
    ])

    handle_optin = Return(Int(1))
    handle_closeout = Return(Int(0))
    handle_updateapp = Return(Int(0))
    handle_deleteapp = Return(Int(0))
    scratchCount = ScratchVar(TealType.uint64)
    localCount = ScratchVar(TealType.uint64)

    # for add ENERGY_UPLOAD 
    add_global = Seq([
        scratchCount.store(App.globalGet(ENERGY_UPLOAD)),
        App.globalPut(ENERGY_UPLOAD, scratchCount.load() + Int(1)),
        App.localPut(Txn.sender(), ENERGY, App.localGet(Txn.sender(), ENERGY) - Int(1)),
        App.localPut(Txn.sender(), CURRENCY, App.localGet(Txn.sender(), CURRENCY) + Int(1)),
        Return(Int(1))
    ])

    # for minus ENERGY_UPLOAD
    deduct_global = Seq([
        scratchCount.store(App.globalGet(ENERGY_UPLOAD)),
        App.globalPut(ENERGY_UPLOAD, scratchCount.load() - Int(1)),
        App.localPut(Txn.sender(), ENERGY, App.localGet(Txn.sender(), ENERGY) + Int(1)),
        App.localPut(Txn.sender(), CURRENCY, App.localGet(Txn.sender(), CURRENCY) - Int(1)),
        Return(Int(1))
    ])

    add_local = Seq([
        localCount.store(App.localGet(Txn.sender(), CURRENCY)),
        App.localPut(Txn.sender(), CURRENCY, localCount.load() + Int(10)),
        localCount.store(App.localGet(Txn.sender(), ENERGY)),
        App.localPut(Txn.sender(), ENERGY, localCount.load() + Int(10)),
        Return(Int(1))
    ])

    deduct_local = Seq([
        localCount.store(App.localGet(Txn.sender(), CURRENCY)),
        App.localPut(Txn.sender(), CURRENCY, localCount.load() - Int(10)),
        localCount.store(App.localGet(Txn.sender(), ENERGY)),
        App.localPut(Txn.sender(), ENERGY, localCount.load() - Int(10)),
        Return(Int(1))
    ])



    handle_noop = Seq(
        Assert(Global.group_size() == Int(1)), 
        Cond(
            [Txn.application_args[0] == Bytes("Add_Global"), add_global], 
            [Txn.application_args[0] == Bytes("Deduct_Global"), deduct_global],
            [Txn.application_args[0] == Bytes("Add_Local"), add_local], 
            [Txn.application_args[0] == Bytes("Deduct_Local"), deduct_local],
        )
    )


    program = Cond(
        [Txn.application_id() == Int(0), handle_creation],
        [Txn.on_completion() == OnComplete.OptIn, handle_optin],
        [Txn.on_completion() == OnComplete.CloseOut, handle_closeout],
        [Txn.on_completion() == OnComplete.UpdateApplication, handle_updateapp],
        [Txn.on_completion() == OnComplete.DeleteApplication, handle_deleteapp],
        [Txn.on_completion() == OnComplete.NoOp, handle_noop]
    )

    return compileTeal(program, Mode.Application, version=5)


def clear_state_program():
    program = Return(Int(1))
    return compileTeal(program, Mode.Application, version=5)


# Write to file
appFile = open("approval.teal", "w")
appFile.write(approval_program())
appFile.close()

clearFile = open("clear.teal", "w")
clearFile.write(clear_state_program())
clearFile.close()


# if __name__ == "__main__":
#     import os
#     import json

#     path = os.path.dirname(os.path.abspath(__file__))
#     approval, clear, contract = router.compile_program(version=8)

#     # Specify the directory path
#     directory_path = os.path.join(path, "artifacts")

#     # Create the directory if it doesn't exist
#     if not os.path.exists(directory_path):
#         os.makedirs(directory_path)

#     # Dump out the contract as json that can be read in by any of the SDKs
#     with open(os.path.join(path, "artifacts/contract.json"), "w") as f:
#         f.write(json.dumps(contract.dictify(), indent=2))

#     # Write out the approval and clear programs
#     with open(os.path.join(path, "artifacts/approval.teal"), "w") as f:
#         f.write(approval)

#     with open(os.path.join(path, "artifacts/clear.teal"), "w") as f:
#         f.write(clear)