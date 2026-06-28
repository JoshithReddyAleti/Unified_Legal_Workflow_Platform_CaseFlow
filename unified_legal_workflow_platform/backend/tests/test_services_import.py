from app.services import MockDataService


def test_mock_data_service_is_available():
    assert hasattr(MockDataService, "seed_demo_data")
