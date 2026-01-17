// Foods are no longer stored in the database
// They are read directly from lib/config/foods.json
// This file is kept for backward compatibility but does nothing
export async function seedFoods() {
  console.log('ℹ️ Foods are now read from lib/config/foods.json - no database seeding needed');
  return;
}

export default seedFoods;

