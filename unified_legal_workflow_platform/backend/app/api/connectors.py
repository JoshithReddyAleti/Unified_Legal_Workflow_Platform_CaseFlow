from fastapi import APIRouter

router = APIRouter(prefix="/connectors", tags=["connectors"])

CONNECTORS = [
    {
        "id": "outlook",
        "name": "Microsoft Outlook",
        "description": "Sync emails from Outlook/Exchange via Microsoft Graph API",
        "status": "disconnected",
        "icon": "outlook",
        "auth_type": "oauth2",
        "docs_url": "https://learn.microsoft.com/en-us/graph/api/resources/mail-api-overview",
        "features": ["Email ingestion", "Calendar events", "Contact sync"],
        "last_sync": None,
        "messages_synced": 0,
    },
    {
        "id": "gmail",
        "name": "Google Gmail",
        "description": "Sync emails from Gmail via Google Workspace API",
        "status": "disconnected",
        "icon": "gmail",
        "auth_type": "oauth2",
        "docs_url": "https://developers.google.com/gmail/api",
        "features": ["Email ingestion", "Label sync", "Thread tracking"],
        "last_sync": None,
        "messages_synced": 0,
    },
    {
        "id": "teams",
        "name": "Microsoft Teams",
        "description": "Import messages and channels from Microsoft Teams",
        "status": "disconnected",
        "icon": "teams",
        "auth_type": "oauth2",
        "docs_url": "https://learn.microsoft.com/en-us/graph/teams-concept-overview",
        "features": ["Channel messages", "Direct messages", "File attachments"],
        "last_sync": None,
        "messages_synced": 0,
    },
    {
        "id": "slack",
        "name": "Slack",
        "description": "Import messages and threads from Slack workspaces",
        "status": "disconnected",
        "icon": "slack",
        "auth_type": "oauth2",
        "docs_url": "https://api.slack.com/",
        "features": ["Channel messages", "DMs", "Thread context"],
        "last_sync": None,
        "messages_synced": 0,
    },
    {
        "id": "drive",
        "name": "Google Drive",
        "description": "Index legal documents and contracts from Google Drive",
        "status": "disconnected",
        "icon": "drive",
        "auth_type": "oauth2",
        "docs_url": "https://developers.google.com/drive/api",
        "features": ["Document indexing", "Contract analysis", "Version tracking"],
        "last_sync": None,
        "messages_synced": 0,
    },
    {
        "id": "sharepoint",
        "name": "SharePoint / OneDrive",
        "description": "Connect to SharePoint document libraries and OneDrive",
        "status": "disconnected",
        "icon": "sharepoint",
        "auth_type": "oauth2",
        "docs_url": "https://learn.microsoft.com/en-us/sharepoint/dev/",
        "features": ["Document libraries", "File metadata", "Permission sync"],
        "last_sync": None,
        "messages_synced": 0,
    },
]


@router.get("/")
def list_connectors():
    return CONNECTORS


@router.get("/{connector_id}")
def get_connector(connector_id: str):
    for c in CONNECTORS:
        if c["id"] == connector_id:
            return c
    return {"error": "Connector not found"}, 404
