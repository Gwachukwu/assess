exports.getDetails = (req, res, next) => {
  try {
    //send response
    return res.status(200).json({
      message: "My Rule-Validation API",
      status: "success",
      data: {
        name: "Gwachukwu Elebeke",
        github: "@gwachukwu",
        email: "gwachukwuelebeke@gmail.com",
        mobile: "07030821996",
        twitter: "@gwachi7",
      },
    });
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
