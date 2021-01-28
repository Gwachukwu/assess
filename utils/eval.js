exports.evaluate = (condition, field, condition_value) => {
  let result = "";
  switch (condition) {
    case "eq":
      result = field === condition_value;
      break;
    case "neq":
      result = field !== condition_value;
      break;
    case "gt":
      result = field > condition_value;
      break;
    case "gte":
      result = field >= condition_value;
      break;
    case "contains":
      result = field.includes(condition_value);
      break;
    default:
      result = null;
  }
  return result;
};
