import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";

const arr = [
  {
    image:
      "https://www.gstatic.com/meet/user_edu_get_a_link_light_90698cd7b4ca04d3005c962a3756c42d.svg",
    title: "Get link you can share",
    description:
      "Click on Create Room to get roomId you can share with other people you want to meet",
  },
  {
    image:
      "https://www.gstatic.com/meet/user_edu_safety_light_e04a2bbb449524ef7e49ea36d5f25b65.svg",
    title: "Your meeting is Safe",
    description:
      "No one outside your organization can join your meeting unless invited , or admitted by the host",
  },
];

function CarouselForHomePage() {
  return (
    <div className="w-[70%]">
      <Carousel>
        <CarouselContent>
          {arr.map((item) => {
            return (
              <CarouselItem>
                <div className="w-full flex flex-col gap-5 items-center">
                  <img src={item.image} alt="image" />
                  <div className="text-3xl font-semibold text-center">
                    {item.title}
                  </div>
                  <div className="max-w-96 text-center">{item.description}</div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}

export default CarouselForHomePage;
