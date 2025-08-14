/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";

interface MenuBarItem {
  icon: string;
  text: string;
  onclick: () => void;
}
interface MenuBarProps {
  iconArray: MenuBarItem[];
}

const MenuBar: React.FC<MenuBarProps> = ({ iconArray }) => {
  return (
    <div className="flex gap-2">
      {iconArray.map((ele: any) => (
        <div className="flex flex-col flex-wrap items-center">
          <Button variant={"ghost"} size={"icon"} onClick={ele?.onclick}>
            <img src={ele.icon} alt="video control" className="w-full" />
          </Button>
          <div className="text-white">{ele.text}</div>
        </div>
      ))}
    </div>
  );
};

export default MenuBar;
