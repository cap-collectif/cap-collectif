<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20210504104313 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'DebateAnonymousArgument';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'CREATE TABLE debate_anonymous_argument (
                id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\',
                debate_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\',
                updated_at DATETIME DEFAULT NULL,
                created_at DATETIME NOT NULL,
                type ENUM(\'FOR\', \'AGAINST\'),
                body LONGTEXT NOT NULL,
                ip_address VARCHAR(255) DEFAULT NULL,
                navigator LONGTEXT DEFAULT NULL,
                widget_origin_url VARCHAR(255) DEFAULT NULL,
                external_origin ENUM(\'MAIL\', \'WIDGET\'),
                token VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                username VARCHAR(255) DEFAULT NULL,
                moderation_token VARCHAR(255) NOT NULL,
                trashed_status ENUM(\'visible\', \'invisible\'),
                trashed_at DATETIME DEFAULT NULL,
                trashed_reason LONGTEXT DEFAULT NULL,
                published TINYINT(1) NOT NULL,
                publishedAt DATETIME DEFAULT NULL,
                UNIQUE INDEX UNIQ_973AAB43AC6D46AF (moderation_token),
                INDEX IDX_973AAB4339A6B6F6 (debate_id),
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE debate_anonymous_argument ADD CONSTRAINT FK_973AAB4339A6B6F6 FOREIGN KEY (debate_id) REFERENCES debate (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE reporting ADD debate_anonymous_argument_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE reporting ADD CONSTRAINT FK_BD7CFA9F9F624AAE FOREIGN KEY (debate_anonymous_argument_id) REFERENCES debate_anonymous_argument (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'CREATE INDEX IDX_BD7CFA9F9F624AAE ON reporting (debate_anonymous_argument_id)'
        );
        $this->addSql(
            'ALTER TABLE votes ADD debate_anonymous_argument_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE votes ADD CONSTRAINT FK_518B7ACF9F624AAE FOREIGN KEY (debate_anonymous_argument_id) REFERENCES debate_anonymous_argument (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_518B7ACF9F624AAE ON votes (debate_anonymous_argument_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE votes DROP FOREIGN KEY FK_518B7ACF9F624AAE');
        $this->addSql('DROP INDEX IDX_518B7ACF9F624AAE ON votes');
        $this->addSql('ALTER TABLE votes DROP debate_anonymous_argument_id');
        $this->addSql('ALTER TABLE reporting DROP FOREIGN KEY FK_BD7CFA9F9F624AAE');
        $this->addSql('DROP TABLE debate_anonymous_argument');
        $this->addSql('DROP INDEX IDX_BD7CFA9F9F624AAE ON reporting');
        $this->addSql('ALTER TABLE reporting DROP debate_anonymous_argument_id');
    }
}
