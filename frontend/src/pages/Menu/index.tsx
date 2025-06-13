import { useState, useEffect } from "react";
import axios from "@/services/axiosInstance";
import { DayMenu } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import ModalDialog from "@/components/ModalDialog";
import { Button } from "@/components/ui/button";

const SELECTED_VARIANT_KEY = "selectedVariant";
const MENU_EXPIRY_DATE_KEY = "menuExpiryDate";

const Menu = () => {
  const [menuData, setMenuData] = useState<DayMenu[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [menuExpiryDate, setMenuExpiryDate] = useState<Date | null>(null);
  const [modalType, setModalType] = useState<"alert" | "confirm" | null>(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [currentVariant, setCurrentVariant] = useState<number | null>(null);

  const variantsCount = 3;

  useEffect(() => {
    const storedVariant = localStorage.getItem(SELECTED_VARIANT_KEY);
    const storedExpiry = localStorage.getItem(MENU_EXPIRY_DATE_KEY);
    const storedMenu = localStorage.getItem("menuData");

    if (storedVariant !== null) {
      setSelectedVariant(Number(storedVariant));
    }

    if (storedExpiry) {
      const expiryDate = new Date(storedExpiry);
      setMenuExpiryDate(expiryDate);

      if (storedMenu) {
        try {
          const parsedMenu = JSON.parse(storedMenu);
          if (
            parsedMenu.length > 0 &&
            parsedMenu[0].date === expiryDate.toISOString().split("T")[0]
          ) {
            setMenuData(parsedMenu);
          }
        } catch {}
      }
    }
  }, []);

  const fetchCurrentShippingDate = async (): Promise<Date | null> => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/shipping");
      const currentShipping = res.data.find((s: any) => s.is_current);
      if (currentShipping && currentShipping.departure_date) {
        return new Date(currentShipping.departure_date);
      }
      return null;
    } catch {
      setError("Failed to fetch shipping data");
      return null;
    }
  };

  const fetchMenu = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const currentShippingDate = await fetchCurrentShippingDate();

      if (!currentShippingDate) {
        setError("Current shipping data not found");
        setIsLoading(false);
        return;
      }

      if (
        menuExpiryDate &&
        currentShippingDate.getTime() === menuExpiryDate.getTime() &&
        selectedVariant !== null
      ) {
        setModalMessage("Menu is already up to date with current shipping.");
        setModalType("alert");
        setIsLoading(false);
        return;
      }

      const res = await axios.get("http://127.0.0.1:8000/generate");
      setMenuData(res.data);

      if (res.data.length > 0 && res.data[0].date) {
        const expiryFromServer = new Date(res.data[0].date);

        localStorage.removeItem(SELECTED_VARIANT_KEY);
        localStorage.removeItem(MENU_EXPIRY_DATE_KEY);

        setSelectedVariant(null);
        setMenuExpiryDate(expiryFromServer);

        localStorage.setItem("menuData", JSON.stringify(res.data));

        localStorage.setItem(
          MENU_EXPIRY_DATE_KEY,
          expiryFromServer.toISOString()
        );
      }
    } catch (err) {
      setError("Failed to fetch menu data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVariantClick = (variantIndex: number) => {
    if (selectedVariant !== null) {
      setModalMessage("Menu already selected for current period.");
      setModalType("alert");
      setCurrentVariant(variantIndex);
      return;
    }
    setModalType("confirm");
    setCurrentVariant(variantIndex);
  };

  const handleConfirm = async (variantIndex: number) => {
    try {
      await axios.post("http://127.0.0.1:8000/menu/select", {
        variant_index: variantIndex,
      });

      if (menuExpiryDate) {
        localStorage.setItem(SELECTED_VARIANT_KEY, variantIndex.toString());
        localStorage.setItem(
          MENU_EXPIRY_DATE_KEY,
          menuExpiryDate.toISOString()
        );
      }

      setSelectedVariant(variantIndex);
      setModalMessage(`Variant ${variantIndex + 1} selected successfully!`);
      setModalType("alert");
    } catch (error) {
      setModalMessage("Failed to select variant. Please try again.");
      setModalType("alert");
    } finally {
      setCurrentVariant(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 overflow-scroll">
      <div className="p-3 m-2 rounded-lg flex gap-6 bg-background shadow-md outline-1 outline-border">
        <div className="p-3 rounded-md flex gap-6 bg-card shadow-md outline-1 outline-border w-full">
          <Button
            className="w-[10%] ml-2"
            onClick={fetchMenu}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Generate"}
          </Button>
        </div>
      </div>

      {error && <div className="text-red-500">{error}</div>}

      {!isLoading && (
        <div className="p-8 m-2 flex flex-row gap-4 outline-1 outline-border rounded-xl bg-background h-full overflow-y-scroll">
          {[...Array(variantsCount)].map((_, variantIndex) => {
            const isSelected = selectedVariant === variantIndex;

            return (
              <Card
                key={variantIndex}
                onClick={() => handleVariantClick(variantIndex)}
                className={`rounded-lg bg-card p-4 flex flex-col overflow-scroll transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-[0_0_8px_2px_rgba(59,130,246,0.9)] cursor-pointer ${
                  isSelected
                    ? "border-4 border-blue-500 shadow-[0_0_15px_4px_rgba(59,130,246,0.9)]"
                    : ""
                }`}
                style={{
                  fontSize: "1.1rem",
                  width: "33%",
                }}
              >
                <div className="flex flex-col gap-6 min-w-[320px] flex-grow bg-card-background rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-extrabold text-center">
                    Variant {variantIndex + 1}
                  </h2>

                  {menuData.map((day, dayIndex) => {
                    const variant = day.variants[variantIndex];
                    if (!variant) return null;

                    return (
                      <Card
                        key={dayIndex}
                        className="rounded-lg bg-background p-4 flex flex-col"
                        style={{ fontSize: "1.1rem" }}
                      >
                        <CardContent className="flex flex-col gap-3 p-0">
                          <h3 className="font-semibold text-lg">{day.name}</h3>
                          <p className="text-muted-foreground text-sm mb-3">
                            {day.date}
                          </p>

                          <ul className="text-base mb-3">
                            {variant.recipes.map((r, i) => (
                              <li key={i} className="text-muted-foreground">
                                • {r.name}
                              </li>
                            ))}
                          </ul>

                          <div className="text-sm text-muted-foreground flex flex-col gap-1">
                            <span>
                              🍽 Calories: {variant.total_calories.toFixed(0)}{" "}
                              kcal
                            </span>
                            <span>
                              💪 Protein: {variant.total_protein.toFixed(1)} g
                            </span>
                            <span>
                              🧈 Fat: {variant.total_fat.toFixed(1)} g
                            </span>
                            <span>
                              🍞 Carbs: {variant.total_carbs.toFixed(1)} g
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </Card>
            );
          })}

          {modalType === "alert" && modalMessage && (
            <ModalDialog
              isOpen={true}
              message={modalMessage}
              type="alert"
              onClose={() => {
                setModalType(null);
                setModalMessage(null);
              }}
            />
          )}

          {modalType === "confirm" && currentVariant !== null && (
            <ModalDialog
              isOpen={true}
              message={`Are you sure you want to pick variant ${
                currentVariant + 1
              }?`}
              type="confirm"
              onConfirm={() => handleConfirm(currentVariant)}
              onCancel={() => {
                setModalType(null);
                setCurrentVariant(null);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Menu;
