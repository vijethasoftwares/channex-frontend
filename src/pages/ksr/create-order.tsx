import Container from "@/components/container";
import { RoomProps } from "@/components/types/app";
import { SERVER_URL, cn, useGlobalContext } from "@/lib/utils";
import { Button, Select, SelectItem, Selection } from "@nextui-org/react";
import axios, { AxiosError } from "axios";
import { ChevronDown, Loader2 } from "lucide-react";
import { FC, useEffect, useState } from "react";

interface FoodMenuCategory {
  name: string;
  items: FoodMenuItem[];
}

interface FoodMenuItem {
  name: string;
  price: number;
  quantity: number;
  order_quantity: number;
}

const CreateOrder = () => {
  const { user, selectedProperty } = useGlobalContext();
  const [categories, setCategories] = useState<FoodMenuCategory[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState<boolean>(false);
  const [orderedItems, setOrderedItems] = useState<FoodMenuItem[]>([]);
  const [roomDetails, setRoomDetails] = useState<RoomProps[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Selection>(new Set([]));
  const [guests, setGuests] = useState<RoomProps>();
  const [selectedGuest, setSelectedGuest] = useState<Selection>(new Set([]));

  //prices
  const [total, setTotal] = useState<number>(0);
  const [cgst, setCgst] = useState<number>(0);
  const [sgst, setSgst] = useState<number>(0);
  const [grandTotal, setGrandTotal] = useState<number>(0);

  useEffect(() => {
    const fetchInventory = async () => {
      if (!user) {
        return;
      }
      if (!selectedProperty) {
        return;
      }
      setIsLoadingInventory(true);
      try {
        const res = await axios.get(
          SERVER_URL + `/manager/inventory/ksr/${selectedProperty}`,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );
        const data = res.data;
        const foodMenu = data?.foodMenu as FoodMenuCategory[];
        foodMenu.map((category) => {
          category.items.map((item) => {
            item.order_quantity = 0;
          });
        });
        setCategories(foodMenu);
        setRoomDetails(data?.rooms);
      } catch (error) {
        const err = error as AxiosError & {
          response: { data: { message: string } };
        };
        console.log(err?.response?.data?.message);
      } finally {
        setIsLoadingInventory(false);
      }
    };
    if (user && selectedProperty) {
      fetchInventory();
    }
  }, [user, selectedProperty]);

  useEffect(() => {
    const orderedItems = categories.flatMap((category) => {
      return category.items.filter((item) => item.order_quantity > 0);
    });
    console.log(orderedItems, "orderedItems");
    if (orderedItems.length > 0) {
      setOrderedItems(orderedItems);
    }
    // console.log(orderedItems, "orderedItems");
  }, [categories]);

  console.log(selectedGuest, "selectedGuest");

  useEffect(() => {
    setGuests(
      roomDetails?.find(
        (room) =>
          room.roomNumber.toString() === Array.from(selectedRoom).toString()
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoom]);

  if (isLoadingInventory) {
    return (
      <Container>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-7 h-7 text-zinc-900 animate-spin mr-2" />{" "}
          Loading Inventory
        </div>
      </Container>
    );
  }
  return (
    <Container className="flex gap-2.5 items-start">
      <div className="flex-1 flex flex-col *:w-full gap-2.5">
        {categories?.map((category, i) => {
          return (
            <InventoryItem
              key={i}
              category={category}
              setCategory={setCategories}
              setTotal={setTotal}
              setCgst={setCgst}
              setSgst={setSgst}
              setGrandTotal={setGrandTotal}
            />
          );
        })}
      </div>
      <div className="w-[350px] h-full p-3 flex flex-col justify-between items-start *:w-full gap-2.5">
        <div className="flex flex-col justify-start items-start *:w-full gap-2.5">
          {" "}
          <Select
            name=""
            color="default"
            label="Rooms"
            labelPlacement="outside"
            placeholder="Select Room"
            selectionMode="single"
            selectedKeys={selectedRoom}
            onSelectionChange={setSelectedRoom}
            radius="md"
            size="lg"
            variant="bordered"
          >
            {roomDetails?.map((room) => {
              return (
                <SelectItem
                  key={room.roomNumber.toString()}
                  value={room.roomNumber.toString()}
                >
                  {room.roomNumber.toString()}
                </SelectItem>
              );
            })}
          </Select>
          {guests && (
            <Select
              name=""
              color="default"
              label="Guests"
              labelPlacement="outside"
              placeholder="Select Guest"
              selectionMode="single"
              selectedKeys={selectedGuest}
              onSelectionChange={setSelectedGuest}
              radius="md"
              size="lg"
              variant="bordered"
            >
              {guests?.guests.map((guest, i) => {
                return (
                  <SelectItem key={i} value={guest.folioId}>
                    {guest.name}
                  </SelectItem>
                );
              })}
            </Select>
          )}
          <h3 className="font-semibold text-xl font-sora">Items Ordered</h3>
          <div className="flex flex-col *:w-full divide-y">
            {orderedItems?.map((item, i) => {
              return (
                <div
                  key={i}
                  className="flex items-center justify-start *:text-left py-2"
                >
                  <h4 className="text-sm font-medium flex-1">{item.name}</h4>
                  <h4 className="ml-5 text-sm">X {item.order_quantity}</h4>
                  <h4 className="ml-5 text-sm">
                    ₹{item.price * item.order_quantity}
                  </h4>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex justify-between items-center w-full">
          <h4 className="font-semibold text-sm">Total</h4>
          <h4 className="font-semibold text-sm">₹{total}</h4>
        </div>
        <div className="flex justify-between items-center w-full">
          <h4 className="font-medium text-sm">CGST(9%)</h4>
          <h4 className="font-medium text-sm">₹{cgst}</h4>
        </div>
        <div className="flex justify-between items-center w-full">
          <h4 className="font-medium text-sm">SGST(9%)</h4>
          <h4 className="font-medium text-sm">₹{sgst}</h4>
        </div>
        <div className="flex justify-between items-center w-full">
          <h4 className="font-medium text-sm">Grand Total</h4>
          <h4 className="font-medium text-sm">₹{grandTotal}</h4>
        </div>
      </div>
    </Container>
  );
};

interface CategoryProps {
  category: FoodMenuCategory;
  setCategory: React.Dispatch<React.SetStateAction<FoodMenuCategory[]>>;
  setTotal: React.Dispatch<React.SetStateAction<number>>;
  setCgst: React.Dispatch<React.SetStateAction<number>>;
  setSgst: React.Dispatch<React.SetStateAction<number>>;
  setGrandTotal: React.Dispatch<React.SetStateAction<number>>;
}

const InventoryItem: FC<CategoryProps> = ({
  category,
  setCategory,
  setTotal,
  setCgst,
  setSgst,
  setGrandTotal,
}) => {
  const [isContentOpen, setIsContentOpen] = useState(true);
  return (
    <div>
      <div
        className={cn(
          "w-full py-2 px-4 rounded-t-xl bg-zinc-100 border border-zinc-200 flex justify-between items-center",
          !isContentOpen && "rounded-b-xl"
        )}
      >
        <h3 className="font-semibold">{category.name}</h3>
        <div className="flex items-center">
          <Button
            variant="light"
            className="bg-zinc-100 text-zinc-900 px-3  min-w-0"
            onClick={() => setIsContentOpen(!isContentOpen)}
          >
            {" "}
            <ChevronDown className="w-5 h-5" />
          </Button>
        </div>
      </div>
      {isContentOpen && (
        <div className="w-full bg-zinc-50 px-4 py-2 rounded-b-xl border border-t-0 border-zinc-200 flex flex-col justify-start items-start *:w-full">
          <div className="flex items-center *:flex-1 *:text-left p-2">
            <h4 className="font-semibold">Items</h4>
            <h4 className="font-semibold ml-5">Availability</h4>
            <h4 className="font-semibold ml-5">Price</h4>
            <h4 className="font-semibold ml-5">Quantity</h4>
          </div>
          <div className="flex flex-col *:w-full gap-1">
            {category?.items.map((item, i) => {
              return (
                <div
                  key={i}
                  className="flex items-center *:flex-1 *:text-left px-2"
                >
                  <h4>{item.name}</h4>
                  <h4 className="ml-5">{item.quantity}</h4>
                  <h4 className="ml-5">₹{item.price}</h4>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="solid"
                      className="text-zinc-100 bg-zinc-900 hover:bg-zinc-800 px-3 min-w-0 w-auto h-auto py-1"
                      radius="lg"
                      onPress={() => {
                        //update the setCategory state
                        const temp = category;
                        temp.items[i].order_quantity += 1;
                        setCategory((prev) => {
                          return prev.map((cat) => {
                            if (cat.name === temp.name) {
                              return temp;
                            }
                            return cat;
                          });
                        });
                        setTotal((prev) => {
                          return prev + item.price;
                        });
                        setCgst((prev) => {
                          return prev + item.price * 0.09;
                        });
                        setSgst((prev) => {
                          return prev + item.price * 0.09;
                        });
                        setGrandTotal((prev) => {
                          return prev + item.price * 0.18;
                        });
                      }}
                    >
                      +
                    </Button>
                    {item?.order_quantity}
                    <Button
                      variant="solid"
                      className="text-zinc-100 bg-zinc-900 px-3 min-w-0 w-auto h-auto py-1 hover:bg-zinc-800"
                      radius="lg"
                      onPress={() => {
                        //update the setCategory state
                        const temp = category;
                        if (temp.items[i].order_quantity == 0) return;
                        temp.items[i].order_quantity -= 1;
                        setCategory((prev) => {
                          return prev.map((cat) => {
                            if (cat.name === temp.name) {
                              return temp;
                            }
                            return cat;
                          });
                        });
                        setTotal((prev) => {
                          return prev - item.price;
                        });
                        setCgst((prev) => {
                          return prev - item.price * 0.09;
                        });
                        setSgst((prev) => {
                          return prev - item.price * 0.09;
                        });
                        setGrandTotal((prev) => {
                          return prev - item.price * 0.18;
                        });
                      }}
                    >
                      -
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateOrder;
