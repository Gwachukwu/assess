const joi = require("joi");
const { evaluate } = require("../utils/eval");

exports.validate = (req, res, next) => {
  const { rule, data } = req.body;

  //     //check type of data
  //  let schema = joi.object();
  //  let result = schema.validate(req.body);
  //  if (result.error) {
  //    return res.status(400).json({
  //       message: "Invalid JSON payload passed.",
  //       status: "error",
  //      data: null,
  //    });
  //  }
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
  
  //check if rule has all required fields
  if (!rule.field) {
    return res.status(400).json({
      message: "rule.field is required.",
      status: "error",
      data: null,
    });
  }
  if (!rule.condition) {
    return res.status(400).json({
      message: "rule.condition is required.",
      status: "error",
      data: null,
    });
  }
  if (!rule.condition_value) {
    return res.status(400).json({
      message: "rule.condition_value is required.",
      status: "error",
      data: null,
    });
  }

  //check type of data
  schema = joi.alternatives().try(joi.object(), joi.string(), joi.array());
  result = schema.validate(data);
  if (result.error) {
    return res.status(400).json({
      message: "data should be an object or array or a string.",
      status: "error",
      data: null,
    });
  }

  try {
    // assign data
    let dataFieldValue = data;
    //if array use this rule(because of that last sample response)
    if(Array.isArray(data)){
      if(!data.includes(rule["field"])){
        return res.status(400).json({
          message: `field ${rule["field"]} is missing from data.`,
          status: "error",
          data: null,
        });
      }
    }
  //if rule.field contains "." e.g mission.count || card.first6
    if(rule["field"].match(/\./g)){
      const arr = rule["field"].match(/\w+(?:'\w+)*/g);
      //since we already know it can't be more than 2 nesting
       dataFieldValue = data[arr[0]][arr[1]];
    }
    //if field is missing in data return error else return data.field
    
    if (!dataFieldValue) {
        return res.status(400).json({
          message: `field ${rule["field"]} is missing from data.`,
          status: "error",
          data: null,
        });
    }

    //check condition
    const check = evaluate(
      rule["condition"],
      dataFieldValue,
      rule["condition_value"]
    );
    if (check) {
      return res.status(200).json({
        message: `field ${rule["field"]} successfully validated.`,
        status: "success",
        data: {
          validation: {
            error: false,
            field: rule["field"],
            field_value: dataFieldValue,
            condition: rule["condition"],
            condition_value: rule["condition_value"],
          },
        },
      });
    }else{
      return res.status(400).json({
        message: `field ${rule["field"]} failed validation.`,
        status: "error",
        data: {
          validation: {
            error: true,
            field: rule["field"],
            field_value: dataFieldValue,
            condition: rule["condition"],
            condition_value: rule["condition_value"],
          },
        },
      });
    }
  } catch (error) {
   //log error
   console.log(error);
   //send error message
   return res.status(500).json({
     message: "Internal server error",
     status: "error",
     data: null,
   });
 }
};
