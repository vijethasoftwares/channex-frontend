import { cn } from "@/lib/utils";
import { Button } from "@nextui-org/react";
import { ChevronDown, Pencil } from "lucide-react";
import { FC, useState } from "react";
import { FoodMenuCategory } from "./types/app";

interface CategoriesProps {
  category: FoodMenuCategory;
  onOpenChange: () => void;
  setCategoryName: (name: string) => void;
  setIsUpdating: (isUpdating: boolean) => void;
  setItemName: (name: string) => void;
  setQuantity: (quantity: string) => void;
  setPrice: (price: string) => void;
}

const Categories: FC<CategoriesProps> = ({
  category,
  onOpenChange,
  setCategoryName,
  setIsUpdating,
  setItemName,
  setQuantity,
  setPrice,
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
            className="bg-zinc-100 text-zinc-900 px-3  min-w-0 font-medium"
            onClick={() => {
              setCategoryName(category.name);
              setIsUpdating(false);
              onOpenChange();
            }}
          >
            {" "}
            Add Item
          </Button>
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
            <h4 className="font-semibold ml-5">Edit</h4>
          </div>
          {category?.items.map((item, i) => {
            return (
              <div
                key={i}
                className="flex items-center *:flex-1 *:text-left px-2"
              >
                <h4>{item.name}</h4>
                <h4 className="ml-5">{item.quantity}</h4>
                <h4 className="ml-5">₹{item.price}</h4>
                <div>
                  <Button
                    variant="light"
                    className="bg-zinc-100 text-zinc-900 px-3 min-w-0 w-auto"
                    radius="lg"
                    onPress={() => {
                      setCategoryName(category.name);
                      setItemName(item.name);
                      setQuantity(item.quantity.toString());
                      setPrice(item.price.toString());
                      setIsUpdating(true);
                      onOpenChange();
                    }}
                  >
                    {" "}
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Categories;
