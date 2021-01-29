const joi = require("joi");
const { evaluate } = require("../helpers/eval");

exports.validate = (req, res, next) => {
  const { rule, data } = req.body;

  //only an object with 2 keys allowed
  let schema = joi
    .object({
      rule: joi.any(),
      data: joi.any(),
    })
    .max(2);
  let result = schema.validate(req.body);
  if (result.error) {
    return res.status(400).json({
      message: "Invalid JSON payload passed.",
      status: "error",
      data: null,
    });
  }
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
  schema = joi.object();
  result = schema.validate(rule);
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
    if (Array.isArray(data)) {
      if (!data.includes(rule["field"])) {
        return res.status(400).json({
          message: `field ${rule["field"]} is missing from data.`,
          status: "error",
          data: null,
        });
      }
    }

    //if rule.field contains "." e.g mission.count || card.first6
    if (rule["field"].match(/\./g)) {
      const arr = rule["field"].match(/\w+(?:'\w+)*/g);
      //since we already know it can't be more than 2 nesting
      //if field is missing in data return error else return data.field
      if (
        !data.hasOwnProperty(arr[0]) ||
        !data[arr[0]].hasOwnProperty(arr[1])
      ) {
        return res.status(400).json({
          message: `field ${rule["field"]} is missing from data.`,
          status: "error",
          data: null,
        });
      }
      //else assign value
      dataFieldValue = data[arr[0]][arr[1]];
    }

    //if rule field has no "." and data is an object
    if (
      typeof data === "object" &&
      !Array.isArray(data) &&
      !rule["field"].match(/\./g)
    ) {
      //if it doesn't have the key in rule.field
      if (!data.hasOwnProperty(rule["field"])) {
        return res.status(400).json({
          message: `field ${rule["field"]} is missing from data.`,
          status: "error",
          data: null,
        });
      }
      //else
      dataFieldValue = data[rule["field"]];
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
    } else {
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
