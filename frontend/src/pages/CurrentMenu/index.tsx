import { useState, useEffect } from "react";
import axios from "@/services/axiosInstance";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Ingredient = {
  product_id: number;
  product_name: string;
  quantity_in_grams: number;
};

type Recipe = {
  recipe_id: number;
  name: string;
  description: string;
  portions: number;
  calories_per_portion: number;
  protein_per_portion: number;
  fat_per_portion: number;
  carbs_per_portion: number;
  ingredients: Ingredient[];
};

type DayPlan = {
  name: string;
  date: string;
  recipes: Recipe[];
  total_calories: number;
  total_protein: number;
  total_fat: number;
  total_carbs: number;
};

const CurrentMenu = () => {
  const [menuData, setMenuData] = useState<DayPlan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const crewCount = localStorage.getItem("crewCount");

  useEffect(() => {
    const fetchMenu = async () => {
      setIsLoading(true);
      try {
        const storedVariant = localStorage.getItem("selectedVariant");

        const res = await axios.get(
          `http://127.0.0.1:8000/menu?variant=${storedVariant}`
        );
        setMenuData(res.data);
      } catch {
        setError("Failed to fetch current menu");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenu();
  }, []);

  function generatePdfFromMenuData(
    menuData: Array<{
      name: string;
      date: string;
      recipes: Array<{
        recipe_id: number;
        name: string;
        description: string;
        portions: number;
        calories_per_portion: number;
        protein_per_portion: number;
        fat_per_portion: number;
        carbs_per_portion: number;
        ingredients: Array<{
          product_id: number;
          product_name: string;
          quantity_in_grams: number;
        }>;
      }>;
      total_calories: number;
      total_protein: number;
      total_fat: number;
      total_carbs: number;
    }>,
    title: string = "Recipe Report",
    fullName: string = "",
    signatureText: string = ""
  ) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, 20);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const subTitle = "Issued by CrewFoodPlanner Inc.";
    const subTitleWidth = doc.getTextWidth(subTitle);
    doc.text(subTitle, (pageWidth - subTitleWidth) / 2, 28);

    let currentY = 35;

    if (!menuData || menuData.length === 0) {
      doc.text("No recipe data available.", 14, currentY);
      doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
      return;
    }

    menuData.forEach((day, dayIndex) => {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(
        `${day.name} — ${new Date(day.date).toLocaleDateString()}`,
        14,
        currentY
      );
      currentY += 8;

      day.recipes.forEach((recipe) => {
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(recipe.name, 14, currentY);
        currentY += 7;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(recipe.description || "-", 14, currentY);
        currentY += 7;

        const recipeTableHeaders = [
          "Servings",
          "Calories / serving",
          "Protein (g)",
          "Fat (g)",
          "Carbs (g)",
        ];
        const recipeTableBody = [
          [
            String(crewCount),
            String(recipe.calories_per_portion),
            String(recipe.protein_per_portion),
            String(recipe.fat_per_portion),
            String(recipe.carbs_per_portion),
          ],
        ];

        autoTable(doc, {
          startY: currentY,
          head: [recipeTableHeaders],
          body: recipeTableBody,
          theme: "grid",
          styles: { fontSize: 9, cellPadding: 2 },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: "bold",
          },
          margin: { left: 14, right: 14 },
        });

        currentY = (doc as any).lastAutoTable.finalY + 5;

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Ingredients:", 14, currentY);
        currentY += 6;

        doc.setFont("helvetica", "normal");
        const ingredientsText = recipe.ingredients
          .map((i) => `- ${i.product_name}: ${i.quantity_in_grams} g`)
          .join("\n");
        const splitIngredients = doc.splitTextToSize(
          ingredientsText,
          pageWidth - 28
        );
        doc.text(splitIngredients, 14, currentY);
        currentY += splitIngredients.length * 6;

        currentY += 5;
      });

      if (currentY > 300) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Daily Totals:", 14, currentY);
      currentY += 6;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Calories: ${day.total_calories} kcal | Protein: ${day.total_protein} g | Fat: ${day.total_fat} g | Carbs: ${day.total_carbs} g`,
        14,
        currentY
      );
      currentY += 10;
    });

    const signatureSpacing = 20;
    const bottomY = doc.internal.pageSize.getHeight() - 50;
    doc.addPage();

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const labels = ["Full Name:", "Signature:", "Clarification:"];
    labels.forEach((label, i) => {
      const y = bottomY + i * signatureSpacing;
      doc.text(label, 14, y);
      doc.line(45, y, pageWidth - 20, y);
    });

    if (fullName) {
      doc.text(fullName, 50, bottomY);
    }
    if (signatureText) {
      doc.text(signatureText, 50, bottomY + signatureSpacing * 2);
    }

    doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
  }

  const handleReport = async () => {
    generatePdfFromMenuData(menuData, "Recipe List Signature Sheet");
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (menuData.length === 0) return <p>No menu data available.</p>;

  return (
    <div className="flex flex-col gap-4 overflow-scroll">
      <div className="p-3 m-2 rounded-lg flex gap-6 bg-background shadow-md outline-1 outline-border">
        <div className="p-3 rounded-md flex gap-6 bg-card shadow-md outline-1 outline-border w-full">
          <Button
            className="w-[10%] ml-2"
            onClick={handleReport}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Generate a report"}
          </Button>
        </div>
      </div>
      {menuData && (
        <div className="p-8 m-2 flex flex-col gap-4 outline-1 outline-border rounded-xl bg-background h-full overflow-y-scroll">
          {menuData.map((day) => (
            <Card key={day.date} className="p-6 bg-card shadow-lg rounded-xl">
              <CardContent>
                <h2 className="text-2xl font-bold">{day.name}</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {new Date(day.date).toLocaleDateString()}
                </p>

                {day.recipes.map((recipe) => (
                  <div
                    key={recipe.recipe_id}
                    className="mb-6 outline-1 outline-border rounded-lg p-4 bg-card"
                  >
                    <h3 className="text-xl font-semibold">{recipe.name}</h3>
                    <p className="text-sm italic mb-2">{recipe.description}</p>

                    <div className="text-sm grid grid-cols-2 sm:grid-cols-5 gap-2 mb-2">
                      <div>
                        <strong>Servings:</strong> {crewCount}
                      </div>
                      <div>
                        <strong>🍽 Calories / serving:</strong>{" "}
                        {recipe.calories_per_portion}
                      </div>
                      <div>
                        <strong>💪 Protein:</strong>{" "}
                        {recipe.protein_per_portion}g
                      </div>
                      <div>
                        <strong>🧈 Fat:</strong> {recipe.fat_per_portion}g
                      </div>
                      <div>
                        <strong>🍞 Carbs:</strong> {recipe.carbs_per_portion}g
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold mb-1">Ingredients:</p>
                      <ul className="list-disc list-inside text-sm">
                        {recipe.ingredients.map((ingredient) => (
                          <li key={ingredient.product_id}>
                            {ingredient.product_name} —{" "}
                            {ingredient.quantity_in_grams} g
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}

                <div className="mt-4 text-sm">
                  <p>
                    <strong>Daily total:</strong>
                  </p>
                  <div className="text-sm text-muted-foreground flex flex-col gap-1">
                    <span>🍽 Calories: {day.total_calories} kcal</span>
                    <span>💪 Protein: {day.total_protein} g</span>
                    <span>🧈 Fat: {day.total_fat} g</span>
                    <span>🍞 Carbs: {day.total_carbs} g</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrentMenu;
