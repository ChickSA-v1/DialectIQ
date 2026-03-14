/// App-wide constants
const String apiBaseUrl = 'https://dialectiq-api-297578317935.me-central1.run.app';

/// Package pricing (SAR/month)
const Map<String, double> packagePrices = {
  'basic': 500.0,
  'advanced': 1500.0,
  'enterprise': 2500.0,
};

/// Package limits
const Map<String, Map<String, int>> packageLimits = {
  'basic': {'max_businesses': 1, 'max_reviews': 500},
  'advanced': {'max_businesses': 5, 'max_reviews': 2000},
  'enterprise': {'max_businesses': 999, 'max_reviews': 999999},
};

/// Allowed file extensions for uploads
const List<String> allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
const int maxFileSize = 10 * 1024 * 1024; // 10 MB
