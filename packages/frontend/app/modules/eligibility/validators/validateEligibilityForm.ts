export const validateEligibilityForm = (formData: FormData) => {
  const errors: { [key: string]: string } = {};

  const fieldName = formData.get("field-name");
  const fieldValue = formData.get("field-value");
  const fieldComparator = formData.get("field-comparator");

  if (!fieldName) {
    errors["field-name"] = "The field name is required.";
  }

  if (!fieldValue) {
    errors["field-value"] = "The field values are required.";
  }

  if (!fieldComparator) {
    errors["field-comparator"] = "The field comparator is required.";
  }

  return errors;
};