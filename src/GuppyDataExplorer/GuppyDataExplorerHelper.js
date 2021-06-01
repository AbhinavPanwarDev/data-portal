// if true, means user don't have access to any project
export function checkForNoAccessibleProject(
  accessibleFieldObject,
  fieldToCheck
) {
  if (!accessibleFieldObject || !accessibleFieldObject[fieldToCheck]) {
    return false;
  }
  return accessibleFieldObject[fieldToCheck].length === 0;
}

// if true, means user have full access to all projects
export function checkForFullAccessibleProject(
  unaccessibleFieldObject,
  fieldToCheck
) {
  if (!unaccessibleFieldObject || !unaccessibleFieldObject[fieldToCheck]) {
    return false;
  }
  return unaccessibleFieldObject[fieldToCheck].length === 0;
}
