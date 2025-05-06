<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20210826165438 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'ON DELETE CASCADE on proposal dependencies';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE official_response DROP FOREIGN KEY FK_FEE68747F4792058');
        $this->addSql(
            'ALTER TABLE official_response ADD CONSTRAINT FK_FEE68747F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE proposal_analysis DROP FOREIGN KEY FK_E168FB18F4792058');
        $this->addSql(
            'ALTER TABLE proposal_analysis ADD CONSTRAINT FK_E168FB18F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE proposal_assessment DROP FOREIGN KEY FK_85600E06F4792058');
        $this->addSql(
            'ALTER TABLE proposal_assessment ADD CONSTRAINT FK_85600E06F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE proposal_decision DROP FOREIGN KEY FK_65F78260F4792058');
        $this->addSql(
            'ALTER TABLE proposal_decision ADD CONSTRAINT FK_65F78260F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE proposal_decision_maker DROP FOREIGN KEY FK_DA5E5855F4792058');
        $this->addSql(
            'ALTER TABLE proposal_decision_maker ADD CONSTRAINT FK_DA5E5855F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE proposal_evaluation DROP FOREIGN KEY FK_61119603F4792058');
        $this->addSql(
            'ALTER TABLE proposal_evaluation ADD CONSTRAINT FK_61119603F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE proposal_social_networks DROP FOREIGN KEY FK_F96248ADF4792058');
        $this->addSql(
            'ALTER TABLE proposal_social_networks ADD CONSTRAINT FK_F96248ADF4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE proposal_supervisor DROP FOREIGN KEY FK_3FA3A18EF4792058');
        $this->addSql(
            'ALTER TABLE proposal_supervisor ADD CONSTRAINT FK_3FA3A18EF4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE proposal_analyst DROP FOREIGN KEY FK_A0F1CC7F4792058');
        $this->addSql(
            'ALTER TABLE proposal_analyst ADD CONSTRAINT FK_A0F1CC7F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE official_response DROP FOREIGN KEY FK_FEE68747F4792058');
        $this->addSql(
            'ALTER TABLE official_response ADD CONSTRAINT FK_FEE68747F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id)'
        );
        $this->addSql('ALTER TABLE proposal_analysis DROP FOREIGN KEY FK_E168FB18F4792058');
        $this->addSql(
            'ALTER TABLE proposal_analysis ADD CONSTRAINT FK_E168FB18F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id)'
        );
        $this->addSql('ALTER TABLE proposal_assessment DROP FOREIGN KEY FK_85600E06F4792058');
        $this->addSql(
            'ALTER TABLE proposal_assessment ADD CONSTRAINT FK_85600E06F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id)'
        );
        $this->addSql('ALTER TABLE proposal_decision DROP FOREIGN KEY FK_65F78260F4792058');
        $this->addSql(
            'ALTER TABLE proposal_decision ADD CONSTRAINT FK_65F78260F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id)'
        );
        $this->addSql('ALTER TABLE proposal_decision_maker DROP FOREIGN KEY FK_DA5E5855F4792058');
        $this->addSql(
            'ALTER TABLE proposal_decision_maker ADD CONSTRAINT FK_DA5E5855F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id)'
        );
        $this->addSql('ALTER TABLE proposal_evaluation DROP FOREIGN KEY FK_61119603F4792058');
        $this->addSql(
            'ALTER TABLE proposal_evaluation ADD CONSTRAINT FK_61119603F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id)'
        );
        $this->addSql('ALTER TABLE proposal_social_networks DROP FOREIGN KEY FK_F96248ADF4792058');
        $this->addSql(
            'ALTER TABLE proposal_social_networks ADD CONSTRAINT FK_F96248ADF4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id)'
        );
        $this->addSql('ALTER TABLE proposal_supervisor DROP FOREIGN KEY FK_3FA3A18EF4792058');
        $this->addSql(
            'ALTER TABLE proposal_supervisor ADD CONSTRAINT FK_3FA3A18EF4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id)'
        );
        $this->addSql('ALTER TABLE proposal_analyst DROP FOREIGN KEY FK_A0F1CC7F4792058');
        $this->addSql(
            'ALTER TABLE proposal_analyst ADD CONSTRAINT FK_A0F1CC7F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id)'
        );
    }
}
