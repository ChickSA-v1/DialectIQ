/// Google Places search models

class PlaceSearchResponse {
  final List<PlaceSearchResult> results;

  PlaceSearchResponse({required this.results});

  factory PlaceSearchResponse.fromJson(Map<String, dynamic> json) =>
      PlaceSearchResponse(
        results: (json['results'] as List<dynamic>)
            .map((e) => PlaceSearchResult.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}

class PlaceSearchResult {
  final String placeId;
  final String name;
  final String? address;
  final double? rating;
  final int? totalRatings;

  PlaceSearchResult({
    required this.placeId,
    required this.name,
    this.address,
    this.rating,
    this.totalRatings,
  });

  factory PlaceSearchResult.fromJson(Map<String, dynamic> json) =>
      PlaceSearchResult(
        placeId: json['place_id'] as String,
        name: json['name'] as String,
        address: json['address'] as String?,
        rating: (json['rating'] as num?)?.toDouble(),
        totalRatings: json['total_ratings'] as int?,
      );
}
