from sqlalchemy.orm import Session
from ..models.audit import AuditLog


class AuditService:
    def __init__(self, db: Session):
        self.db = db

    def log(self, event_type: str, entity_type: str = None, entity_id: str = None,
            matter_id: str = None, user_id: str = None, action: str = None,
            details: dict = None, ai_model_used: str = None, source_references: list = None):
        log = AuditLog(
            event_type=event_type,
            entity_type=entity_type,
            entity_id=entity_id,
            matter_id=matter_id,
            user_id=user_id,
            action=action,
            details=details or {},
            ai_model_used=ai_model_used,
            source_references=source_references or [],
        )
        self.db.add(log)
        self.db.commit()
        return log

    def get_logs(self, matter_id: str = None, entity_type: str = None,
                 limit: int = 100, offset: int = 0) -> list:
        query = self.db.query(AuditLog)
        if matter_id:
            query = query.filter(AuditLog.matter_id == matter_id)
        if entity_type:
            query = query.filter(AuditLog.entity_type == entity_type)
        return query.order_by(AuditLog.created_at.desc()).offset(offset).limit(limit).all()
