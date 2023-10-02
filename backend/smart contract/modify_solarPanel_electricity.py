from pyteal import *

my_router = Router(
    "Trading Sidechain",
    BareCallActions(
        no_op=OnCompleteAction.create_only(Approve()),
        opt_in=OnCompleteAction.call_only(Approve()),
        close_out=OnCompleteAction.call_only(Approve()),
    ),
    clear_state=Approve(),
)


@my_router.method
def solar_panel_power_control_demo_only(
    action: abi.String, a: abi.Uint64, *, output: abi.Uint64
):
    return Seq(
        If(action.get() == Bytes("add1"))
        .Then(output.set(a.get() + Int(1)))
        .ElseIf(action.get() == Bytes("add10"))
        .Then(output.set(a.get() + Int(10)))
        .ElseIf(action.get() == Bytes("add100"))
        .Then(output.set(a.get() + Int(100)))
        .ElseIf(action.get() == Bytes("add1000"))
        .Then(output.set(a.get() + Int(1000)))
        .ElseIf(action.get() == Bytes("sub1"))
        .Then(output.set(a.get() - Int(1)))
        .ElseIf(action.get() == Bytes("sub10"))
        .Then(output.set(a.get() - Int(10)))
        .ElseIf(action.get() == Bytes("sub100"))
        .Then(output.set(a.get() - Int(100)))
        .ElseIf(action.get() == Bytes("sub1000"))
        .Then(output.set(a.get() - Int(1000)))
    )


if __name__ == "__main__":
    import os
    import json

    path = os.path.dirname(os.path.abspath(__file__))
    approval, clear, contract = my_router.compile_program(version=8)

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
