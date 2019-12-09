<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150723160932 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE step DROP FOREIGN KEY FK_43B9FE3CEC91FE48');
        $this->addSql('ALTER TABLE synthesis_element DROP FOREIGN KEY FK_97652E1BEC91FE48');
        $this->addSql('ALTER TABLE synthesis_element DROP FOREIGN KEY FK_97652E1BB68A72A3');
        $this->addSql('ALTER TABLE synthesis_division DROP FOREIGN KEY FK_C5A1238072A85DB0');
        $this->addSql('ALTER TABLE synthesis_element DROP FOREIGN KEY FK_97652E1B727ACA70');
        $this->addSql(
            'ALTER TABLE step CHANGE synthesis_id synthesis_id VARCHAR(255) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE synthesis CHANGE id id VARCHAR(255) NOT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE synthesis_division CHANGE id id VARCHAR(255) NOT NULL COMMENT \'(DC2Type:guid)\', CHANGE original_element_id original_element_id VARCHAR(255) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE synthesis_element ADD link LONGTEXT DEFAULT NULL, CHANGE id id VARCHAR(255) NOT NULL COMMENT \'(DC2Type:guid)\', CHANGE parent_id parent_id VARCHAR(255) DEFAULT NULL COMMENT \'(DC2Type:guid)\', CHANGE original_division_id original_division_id VARCHAR(255) DEFAULT NULL COMMENT \'(DC2Type:guid)\', CHANGE synthesis_id synthesis_id VARCHAR(255) DEFAULT NULL COMMENT \'(DC2Type:guid)\', CHANGE enabled published TINYINT(1) NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE synthesis_user CHANGE id id VARCHAR(255) NOT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE step ADD CONSTRAINT FK_43B9FE3CEC91FE48 FOREIGN KEY (synthesis_id) REFERENCES synthesis (id) ON DELETE SET NULL'
        );
        $this->addSql(
            'ALTER TABLE synthesis_element ADD CONSTRAINT FK_97652E1BEC91FE48 FOREIGN KEY (synthesis_id) REFERENCES synthesis (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE synthesis_element ADD CONSTRAINT FK_97652E1BB68A72A3 FOREIGN KEY (original_division_id) REFERENCES synthesis_division (id) ON DELETE SET NULL'
        );
        $this->addSql(
            'ALTER TABLE synthesis_division ADD CONSTRAINT FK_C5A1238072A85DB0 FOREIGN KEY (original_element_id) REFERENCES synthesis_element (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE synthesis_element ADD CONSTRAINT FK_97652E1B727ACA70 FOREIGN KEY (parent_id) REFERENCES synthesis_element (id) ON DELETE SET NULL'
        );
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE step DROP FOREIGN KEY FK_43B9FE3CEC91FE48');
        $this->addSql('ALTER TABLE synthesis_element DROP FOREIGN KEY FK_97652E1BEC91FE48');
        $this->addSql('ALTER TABLE synthesis_element DROP FOREIGN KEY FK_97652E1BB68A72A3');
        $this->addSql('ALTER TABLE synthesis_division DROP FOREIGN KEY FK_C5A1238072A85DB0');
        $this->addSql('ALTER TABLE synthesis_element DROP FOREIGN KEY FK_97652E1B727ACA70');
        $this->addSql(
            'ALTER TABLE step CHANGE synthesis_id synthesis_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE synthesis CHANGE id id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE synthesis_division CHANGE id id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', CHANGE original_element_id original_element_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE synthesis_element DROP link, CHANGE id id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', CHANGE synthesis_id synthesis_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', CHANGE original_division_id original_division_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', CHANGE parent_id parent_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', CHANGE published enabled TINYINT(1) NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE synthesis_user CHANGE id id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE step ADD CONSTRAINT FK_43B9FE3CEC91FE48 FOREIGN KEY (synthesis_id) REFERENCES synthesis (id) ON DELETE SET NULL'
        );
        $this->addSql(
            'ALTER TABLE synthesis_element ADD CONSTRAINT FK_97652E1BEC91FE48 FOREIGN KEY (synthesis_id) REFERENCES synthesis (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE synthesis_element ADD CONSTRAINT FK_97652E1BB68A72A3 FOREIGN KEY (original_division_id) REFERENCES synthesis_division (id) ON DELETE SET NULL'
        );
        $this->addSql(
            'ALTER TABLE synthesis_division ADD CONSTRAINT FK_C5A1238072A85DB0 FOREIGN KEY (original_element_id) REFERENCES synthesis_element (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE synthesis_element ADD CONSTRAINT FK_97652E1B727ACA70 FOREIGN KEY (parent_id) REFERENCES synthesis_element (id) ON DELETE SET NULL'
        );
    }
}
