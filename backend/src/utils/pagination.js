/**
 * Pagination and filtering helper for list APIs.
 * Builds skip/limit and optional sort from query params.
 */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * @param {object} query - Express req.query
 * @returns {{ page, limit, skip, sort }}
 */
function getPagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;
  const sort = parseSort(query.sort);
  return { page, limit, skip, sort };
}

/**
 * Parse sort string e.g. "-createdAt,name" into Mongoose sort object.
 */
function parseSort(sortStr) {
  if (!sortStr || typeof sortStr !== 'string') return { createdAt: -1 };
  const obj = {};
  sortStr.split(',').forEach((part) => {
    const trimmed = part.trim();
    if (trimmed.startsWith('-')) obj[trimmed.slice(1)] = -1;
    else if (trimmed) obj[trimmed] = 1;
  });
  return Object.keys(obj).length ? obj : { createdAt: -1 };
}

/**
 * Build filter for text search on given fields.
 */
function textSearchFilter(query, searchParam = 'search', fields = []) {
  const search = query[searchParam];
  if (!search || !fields.length) return {};
  return {
    $or: fields.map((f) => ({ [f]: new RegExp(search, 'i') })),
  };
}

/**
 * Response shape for paginated list.
 */
function paginatedResponse(data, total, page, limit) {
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

module.exports = { getPagination, parseSort, textSearchFilter, paginatedResponse, DEFAULT_LIMIT, MAX_LIMIT };
