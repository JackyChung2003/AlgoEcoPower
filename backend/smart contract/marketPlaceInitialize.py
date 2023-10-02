from pyteal import *

# Configuration Constants
MAX_AREA_NAME_LENGTH = Int(25)
MAX_QUANTITY = Int(1000)
MAX_UNIT_PRICE = Int(2000)

# Action Constants
SELLER_BOX_INDEX = Int(4)  # Index of the seller name in the box
SELLER_BOX_LENGTH = Int(25)
PRODUCT_BOX_INDEX = Int(30)
PRODUCT_BOX_LENGTH = Int(15)

router = Router(
    "Marketplace Initialization",
    BareCallActions(
        no_op=OnCompleteAction.create_only(Approve()),
        opt_in=OnCompleteAction.call_only(Approve()),
        close_out=OnCompleteAction.call_only(Approve()),
    ),
    clear_state=Approve(),
)


@router.method
def create_product_box(
    seller_area: abi.String, quantity: abi.Uint64, unit_price: abi.Uint64
):
    Seq(
        Assert(Len(seller_area.get()) > Int(0)),
        Assert(Len(seller_area.get()) <= MAX_AREA_NAME_LENGTH),
        Assert(quantity.get() > Int(0)),
        Assert(quantity.get() <= MAX_QUANTITY),
        Assert(unit_price.get() > Int(0)),
        Assert(unit_price.get() <= MAX_UNIT_PRICE),
    )

    Seq(
        App.box_create(Concat(Bytes("Seller located at "), seller_area.get()), Int(50)),
    )


@router.method
def read_seller(box_id: abi.String, *, output: abi.String):
    return output.set(
        App.box_extract(
            Concat(Bytes("ID:"), box_id.get()), SELLER_BOX_INDEX, SELLER_BOX_LENGTH
        )
    )


@router.method
def read_product(box_id: abi.String, *, output: abi.String):
    return output.set(
        App.box_extract(
            Concat(Bytes("ID:"), box_id.get()), PRODUCT_BOX_INDEX, PRODUCT_BOX_LENGTH
        )
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
