function toResponse(result, successStatus = 200) {
  if (result.error) {
    return Response.json({ message: result.error.message }, { status: result.error.status });
  }
  return Response.json(result.data, { status: successStatus });
}

module.exports = { toResponse };
