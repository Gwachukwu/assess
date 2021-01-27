const joi = require("joi");

exports.validate = (req, res, next) => {
  const { rule, data } = req.body;

  try {
      //if no rule
  if (!rule) {
    return res.status(400).json({
      message: "rule is required.",
      status: "error",
      data: null,
    });
  }

  //if no data
  if (!data) {
    return res.status(400).json({
      message: "data is required.",
      status: "error",
      data: null,
    });
  }
  //check rule type
  let schema = joi.object();
let result = schema.validate(rule);
  if (result.error) {
    return res.status(400).json({
       message: "rule should be an object.",
       status: "error",
      data: null,
    });
  }

  //check type of data
  schema = joi.alternatives().try(joi.object(), joi.string(),joi.array());
  result = schema.validate(data);
  if (result.error) {
    return res.status(400).json({
       message: "data should be an object or array or a string.",
       status: "error",
      data: null,
    });
  }

 //check type of data
 schema = joi.object();
 result = schema.validate(req.body);
 if (result.error) {
   return res.status(400).json({
      message: "Invalid JSON payload passed.",
      status: "error",
     data: null,
   });
 }  
  return res.send("All correct sir")
  } catch (error) {
      console.log(error);
      next(error);
  }
};
