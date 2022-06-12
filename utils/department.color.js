exports.getByDepartment = (department) => {
 let color;
 switch (department.toLowerCase()) {
  case "cloud":
   color = "#912be1";
   break;
  case "data analytics":
   color = "#b6422e";
   break;
  case "software development":
   color = "#3910de";
  case "software engineering":
   color = "#3910de";
  case "software engineer":
   color = "#3910de";
   break;

  default:
   color = "#ffbe0a";
   break;
 }
 return color
}