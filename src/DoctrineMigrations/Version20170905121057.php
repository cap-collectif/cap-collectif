<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\ORM\Id\UuidGenerator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class Version20170905121057 extends AbstractMigration implements ContainerAwareInterface
{
    private $generator;
    private $em;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->em = $container->get('doctrine')->getManager();
        $this->generator = new UuidGenerator();
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE district ADD form_id INT');
        $this->addSql(
            'ALTER TABLE district ADD CONSTRAINT FK_31C154875FF69B7D FOREIGN KEY (form_id) REFERENCES proposal_form (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_31C154875FF69B7D ON district (form_id)');
    }

    public function postUp(Schema $schema): void
    {
        $proposalForms = $this->connection->fetchAll('SELECT * from proposal_form');
        $districts = $this->connection->fetchAll('SELECT * from district');
        if (0 === \count($proposalForms)) {
            foreach ($districts as $district) {
                $this->connection->delete('district', ['id' => $district['id']]);
            }

            return;
        }

        // We need to set the corresponding district for the first form
        $formId = $proposalForms[0]['id'];
        foreach ($districts as $district) {
            $this->connection->update(
                'district',
                ['form_id' => $formId],
                ['id' => $district['id']]
            );
        }
        if (1 === \count($proposalForms)) {
            return;
        }

        // If there is more than one proposal forms, we link districts to each of them
        unset($proposalForms[0]);

        foreach ($proposalForms as $proposalForm) {
            foreach ($districts as $district) {
                $district['form_id'] = $proposalForm['id'];
                $previousDistrictId = $district['id'];
                $newDistrictId = $this->generator->generate($this->em, null);
                $district['id'] = $newDistrictId;
                $this->connection->insert('district', $district);
                // We must update district for each proposal
                $proposals = $this->connection->fetchAll('SELECT * from proposal');
                foreach ($proposals as $proposal) {
                    if (
                        $proposal['district_id'] === $previousDistrictId &&
                        $proposal['proposal_form_id'] === $proposalForm['id']
                    ) {
                        $this->connection->update(
                            'proposal',
                            ['district_id' => $newDistrictId],
                            ['id' => $proposal['id']]
                        );
                    }
                }
            }
        }
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE district DROP FOREIGN KEY FK_31C154875FF69B7D');
        $this->addSql('DROP INDEX IDX_31C154875FF69B7D ON district');
        $this->addSql('ALTER TABLE district DROP form_id');
    }
}
