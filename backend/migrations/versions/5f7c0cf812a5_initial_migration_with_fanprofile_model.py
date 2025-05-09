"""Initial migration with FanProfile model

Revision ID: 5f7c0cf812a5
Revises: 
Create Date: 2025-05-02 18:24:44.330554

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5f7c0cf812a5'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('fan_profile',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('full_name', sa.String(length=150), nullable=True),
    sa.Column('address', sa.String(length=300), nullable=True),
    sa.Column('cpf', sa.String(length=14), nullable=True),
    sa.Column('interests', sa.Text(), nullable=True),
    sa.Column('activities_last_year', sa.Text(), nullable=True),
    sa.Column('events_last_year', sa.Text(), nullable=True),
    sa.Column('purchases_last_year', sa.Text(), nullable=True),
    sa.Column('document_path', sa.String(length=256), nullable=True),
    sa.Column('document_validated', sa.Boolean(), nullable=True),
    sa.Column('social_media_links', sa.Text(), nullable=True),
    sa.Column('esports_profile_links', sa.Text(), nullable=True),
    sa.Column('esports_links_validated', sa.Boolean(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('fan_profile', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_fan_profile_cpf'), ['cpf'], unique=True)
        batch_op.create_index(batch_op.f('ix_fan_profile_full_name'), ['full_name'], unique=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('fan_profile', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_fan_profile_full_name'))
        batch_op.drop_index(batch_op.f('ix_fan_profile_cpf'))

    op.drop_table('fan_profile')
    # ### end Alembic commands ###
