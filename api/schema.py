"""
SQLAlchemy Schema for AetherOS Virtual File System (VFS) and Process Registry.
Architected for Neon / Supabase Serverless Postgres.
"""

from datetime import datetime
import uuid
from sqlalchemy import (
    Column,
    String,
    Boolean,
    BigInteger,
    Text,
    DateTime,
    ForeignKey,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class VFSNode(Base):
    """
    Virtual File System Node (Directory or File).
    Hierarchical adjacency list model with indexed absolute path for fast lookups.
    """
    __tablename__ = "vfs_nodes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    parent_id = Column(
        UUID(as_uuid=True),
        ForeignKey("vfs_nodes.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    name = Column(String(255), nullable=False)
    path = Column(String(1024), nullable=False, unique=True, index=True)
    is_directory = Column(Boolean, nullable=False, default=False)
    size = Column(BigInteger, nullable=False, default=0)
    mime_type = Column(String(64), nullable=False, default="text/plain")
    content = Column(Text, nullable=True, default="")
    permissions = Column(String(10), nullable=False, default="-rw-r--r--")
    owner = Column(String(64), nullable=False, default="user")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    children = relationship(
        "VFSNode",
        backref="parent",
        remote_side=[id],
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        Index("idx_vfs_parent_name", "parent_id", "name"),
        Index("idx_vfs_path", "path"),
    )

    def to_dict(self):
        return {
            "id": str(self.id),
            "parent_id": str(self.parent_id) if self.parent_id else None,
            "name": self.name,
            "path": self.path,
            "is_directory": self.is_directory,
            "size": self.size,
            "mime_type": self.mime_type,
            "content": self.content if not self.is_directory else None,
            "permissions": self.permissions,
            "owner": self.owner,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class ProcessRecord(Base):
    """
    Serverless Process State Registry.
    Mirrored into Upstash Redis for ephemeral lookup with durable Postgres logging.
    """
    __tablename__ = "os_processes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pid = Column(BigInteger, nullable=False, index=True)
    command = Column(String(255), nullable=False)
    args = Column(Text, nullable=True, default="")
    cwd = Column(String(1024), nullable=False, default="/home/user")
    status = Column(String(32), nullable=False, default="running")  # running, sleeping, stopped, zombie
    cpu_percent = Column(String(16), nullable=False, default="0.0%")
    memory_mb = Column(BigInteger, nullable=False, default=12)
    owner = Column(String(64), nullable=False, default="user")
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    def to_dict(self):
        return {
            "id": str(self.id),
            "pid": self.pid,
            "command": self.command,
            "args": self.args,
            "cwd": self.cwd,
            "status": self.status,
            "cpu_percent": self.cpu_percent,
            "memory_mb": self.memory_mb,
            "owner": self.owner,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
