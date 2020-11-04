const APIFeatures = require('../utils/apiFeatures');

exports.getAll = async (Model, filter = {}, queryString = {}) => {
  const features = new APIFeatures(Model.find(filter), queryString)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  return features.query;
};

exports.createOne = async (Model, creatingObject) => {
  return Model.create(creatingObject);
};

exports.getOne = async (Model, id) => {
  return Model.findById(id);
};

exports.deleteOne = async (Model, id) => {
  return Model.findByIdAndDelete(id);
};

exports.updateOne = async (Model, id, updatingObj) => {
  return Model.findByIdAndUpdate(id, updatingObj, {
    new: true,
    runValidators: true,
  });
};
