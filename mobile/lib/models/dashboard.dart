/// Dashboard data models

class DashboardResponse {
  final DashboardStats stats;
  final List<ReviewDetail> reviews;
  final int page;
  final int pageSize;
  final int totalPages;

  DashboardResponse({
    required this.stats,
    required this.reviews,
    required this.page,
    required this.pageSize,
    required this.totalPages,
  });

  factory DashboardResponse.fromJson(Map<String, dynamic> json) => DashboardResponse(
    stats: DashboardStats.fromJson(json['stats'] as Map<String, dynamic>),
    reviews: (json['reviews'] as List<dynamic>)
        .map((e) => ReviewDetail.fromJson(e as Map<String, dynamic>))
        .toList(),
    page: json['page'] as int,
    pageSize: json['page_size'] as int,
    totalPages: json['total_pages'] as int,
  );
}

class DashboardStats {
  final int totalReviews;
  final double? avgSentiment;
  final double? avgRating;
  final Map<String, int> urgencyBreakdown;
  final Map<String, int> categoryBreakdown;
  final Map<String, int> dialectBreakdown;

  DashboardStats({
    required this.totalReviews,
    this.avgSentiment,
    this.avgRating,
    required this.urgencyBreakdown,
    required this.categoryBreakdown,
    required this.dialectBreakdown,
  });

  factory DashboardStats.fromJson(Map<String, dynamic> json) => DashboardStats(
    totalReviews: json['total_reviews'] as int? ?? 0,
    avgSentiment: (json['avg_sentiment'] as num?)?.toDouble(),
    avgRating: (json['avg_rating'] as num?)?.toDouble(),
    urgencyBreakdown: _parseIntMap(json['urgency_breakdown']),
    categoryBreakdown: _parseIntMap(json['category_breakdown']),
    dialectBreakdown: _parseIntMap(json['dialect_breakdown']),
  );

  static Map<String, int> _parseIntMap(dynamic data) {
    if (data == null) return {};
    return (data as Map<String, dynamic>).map(
      (k, v) => MapEntry(k, (v as num).toInt()),
    );
  }
}

class ReviewDetail {
  final String id;
  final String businessName;
  final String placeId;
  final String? author;
  final String rawText;
  final int? rating;
  final String? source;
  final double? sentimentScore;
  final String? category;
  final String? urgencyLevel;
  final String? dialectDetected;
  final String? translatedIntent;
  final String? suggestedReply;
  final String? createdAt;

  ReviewDetail({
    required this.id,
    required this.businessName,
    required this.placeId,
    this.author,
    required this.rawText,
    this.rating,
    this.source,
    this.sentimentScore,
    this.category,
    this.urgencyLevel,
    this.dialectDetected,
    this.translatedIntent,
    this.suggestedReply,
    this.createdAt,
  });

  factory ReviewDetail.fromJson(Map<String, dynamic> json) => ReviewDetail(
    id: json['id'] as String,
    businessName: json['business_name'] as String,
    placeId: json['place_id'] as String,
    author: json['author'] as String?,
    rawText: json['raw_text'] as String,
    rating: json['rating'] as int?,
    source: json['source'] as String?,
    sentimentScore: (json['sentiment_score'] as num?)?.toDouble(),
    category: json['category'] as String?,
    urgencyLevel: json['urgency_level'] as String?,
    dialectDetected: json['dialect_detected'] as String?,
    translatedIntent: json['translated_intent'] as String?,
    suggestedReply: json['suggested_reply'] as String?,
    createdAt: json['created_at'] as String?,
  );
}

class FetchReviewsResult {
  final String placeId;
  final String businessName;
  final int reviewsFetched;
  final int reviewsNew;
  final int reviewsAnalyzed;
  final String message;

  FetchReviewsResult({
    required this.placeId,
    required this.businessName,
    required this.reviewsFetched,
    required this.reviewsNew,
    required this.reviewsAnalyzed,
    required this.message,
  });

  factory FetchReviewsResult.fromJson(Map<String, dynamic> json) => FetchReviewsResult(
    placeId: json['place_id'] as String,
    businessName: json['business_name'] as String,
    reviewsFetched: json['reviews_fetched'] as int,
    reviewsNew: json['reviews_new'] as int,
    reviewsAnalyzed: json['reviews_analyzed'] as int,
    message: json['message'] as String,
  );
}
