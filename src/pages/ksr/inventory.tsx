import Container from "@/components/container";
import ContainerBetween from "@/components/container-between";
import ContainerColumn from "@/components/container-column";
import Categories from "@/components/food-menu-categories";
import Heading from "@/components/heading";
import { FoodMenuCategory } from "@/components/types/app";
import { SERVER_URL, useGlobalContext } from "@/lib/utils";
import {
  Button,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Spinner,
  useDisclosure,
} from "@nextui-org/react";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const Inventory = () => {
  const { user, selectedProperty } = useGlobalContext();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isLoadingInventory, setIsLoadingInventory] = useState<boolean>(false);
  const [categories, setCategories] = useState<FoodMenuCategory[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");
  const [itemName, setItemName] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [addingInventory, setAddingInventory] = useState<boolean>(false);

  const handleAddItem = () => {
    if (categoryName === "") {
      toast.error("Please enter category name");
      return;
    }
    if (itemName === "") {
      toast.error("Please enter item name");
      return;
    }
    if (quantity === "") {
      toast.error("Please enter quantity");
      return;
    }
    const category = categories.find((c) => c.name === categoryName);
    if (category) {
      const item = category.items.find((i) => i.name === itemName);
      if (item) {
        item.quantity = parseFloat(quantity);
        item.price = parseFloat(price);
      } else {
        category.items.push({
          name: itemName,
          price: parseFloat(price),
          quantity: parseFloat(quantity),
        });
      }

      setCategories([...categories]);
    } else {
      setCategories([
        ...categories,
        {
          name: categoryName,
          items: [
            {
              name: itemName,
              price: parseFloat(price),
              quantity: parseFloat(quantity),
            },
          ],
        },
      ]);
    }
    setItemName("");
    setQuantity("");
    setPrice("");
    setIsUpdating(false);
  };

  const handleSaveInventory = async () => {
    if (!user) {
      toast.error("Please login to continue");
      return;
    }
    if (!selectedProperty) {
      toast.error("Please select a property to continue");
      return;
    }
    if (categories.length === 0) {
      toast.error("Please add items to continue");
      return;
    }
    setAddingInventory(true);
    try {
      const res = await axios.post(
        SERVER_URL + "/manager/inventory/ksr/create",
        {
          propertyId: selectedProperty,
          foodMenu: categories,
        },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      const data = res.data;
      toast.success(data?.message);
    } catch (error) {
      const err = error as AxiosError & {
        response: { data: { message: string } };
      };
      console.log(err?.response?.data?.message);
    } finally {
      setAddingInventory(false);
    }
  };

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
        setCategories(data?.foodMenu);
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

  return (
    <>
      <Container>
        <ContainerColumn>
          <ContainerBetween>
            <Heading>Inventory</Heading>
            <div className="flex items-center gap-2.5">
              <Button
                className="bg-zinc-100 text-zinc-900 font-medium border border-zinc-200"
                onPress={onOpen}
              >
                Add Items to Inventory
              </Button>
              <Button
                className="bg-zinc-900 text-white font-medium"
                onPress={handleSaveInventory}
              >
                {addingInventory ? "Saving..." : "Save Inventory"}
              </Button>
              <Divider orientation="vertical" className="h-6 mx-3" />
              <Link to="/dashboard/ksr/create-orders">
                <Button className="bg-purple-400 font-medium">
                  Create Order
                </Button>
              </Link>
            </div>
          </ContainerBetween>
          {isLoadingInventory && (
            <div className="flex justify-center items-center px-5 py-10 w-full">
              <Spinner size="lg" color="secondary" />
            </div>
          )}
          {!isLoadingInventory && categories?.length === 0 && (
            <Heading variant="title">No items Added</Heading>
          )}
          {categories?.map((category) => {
            return (
              <Categories
                key={category.name}
                category={category}
                onOpenChange={onOpenChange}
                setCategoryName={setCategoryName}
                setIsUpdating={setIsUpdating}
                setItemName={setItemName}
                setQuantity={setQuantity}
                setPrice={setPrice}
              />
            );
          })}
        </ContainerColumn>
      </Container>
      <Modal
        onClose={() => {
          setCategoryName("");
          setItemName("");
          setQuantity("");
          setPrice("");
          setIsUpdating(false);
        }}
        backdrop="blur"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="font-semibold">
                  {isUpdating ? "Update Item" : "Add Item"}
                </h3>
                <p className="text-gray-500 text-sm font-normal">
                  {isUpdating
                    ? "Update the item details"
                    : "Add a new item to the inventory"}
                </p>
              </ModalHeader>
              <ModalBody className="pb-5">
                <Input
                  type="text"
                  label="Category Name"
                  placeholder="Enter category name"
                  labelPlacement="outside"
                  variant="bordered"
                  value={categoryName}
                  onValueChange={setCategoryName}
                />
                <Input
                  type="text"
                  label="Item Name"
                  placeholder="Enter item name"
                  labelPlacement="outside"
                  variant="bordered"
                  value={itemName}
                  onValueChange={setItemName}
                />
                <Input
                  type="number"
                  label="Quantity"
                  placeholder="Enter quantity"
                  labelPlacement="outside"
                  variant="bordered"
                  value={quantity}
                  onValueChange={setQuantity}
                />
                <Input
                  type="number"
                  label="Price"
                  placeholder="Enter price"
                  labelPlacement="outside"
                  variant="bordered"
                  value={price}
                  onValueChange={setPrice}
                />
                <Button
                  onPress={handleAddItem}
                  variant="light"
                  className="w-full bg-zinc-100 font-medium"
                >
                  {isUpdating ? "Update" : "Add Item"}
                </Button>
              </ModalBody>
              {/* <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  className="bg-zinc-900 text-white"
                  onPress={handleAddCategory}
                >
                  Save
                </Button>
              </ModalFooter> */}
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default Inventory;
