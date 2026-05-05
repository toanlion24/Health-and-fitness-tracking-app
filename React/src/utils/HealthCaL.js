export const calculateBMI = (weight, height) => {
  // Công thức: Cân nặng (kg) / (Chiều cao (m) ^ 2)
  const heightInMeters = height / 100;
  return (weight / (heightInMeters * heightInMeters)).toFixed(1);
};

export const calculateBMR = (weight, height, age, gender) => {
  // Công thức Mifflin-St Jeor
  if (gender === 'male') {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  }
  return (10 * weight) + (6.25 * height) - (5 * age) - 161;
};

export const calculateTDEE = (bmr, activityLevel) => {
  // TDEE = BMR * Chỉ số vận động
  const factors = {
    sedentary: 1.2,      // Ít vận động
    lightlyActive: 1.375, // Vận động nhẹ
    moderatelyActive: 1.55 // Vận động vừa
  };
  return Math.round(bmr * (factors[activityLevel] || 1.2));
};