from pyteal import *

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
def store_in_bytes(number: abi.Uint64):  # Take in an argument that is Uint64
    return App.globalPut(
        Bytes("num_in_bytes"), Itob(number.get())
    )  # Create a global state, then convert uint64 to a byte string


@router.method
def read_in_int(*, output: abi.Uint64):
    return output.set(
        Btoi(App.globalGet(Bytes("num_in_bytes")))
    )  # Get from global state and do Btoi to convert to int
