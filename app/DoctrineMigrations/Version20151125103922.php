<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151125103922 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // Find opinions in which opinion type is not correctly set
        $opinions = $this->connection->fetchAll(
            "
          SELECT o.id as o_id,
            o.step_id as o_step_id,
            o.opinion_type_id as ot_id,
            ot.slug as ot_slug,
            cst.id as o_cst_id,
            otcst.id as ot_cst_id
          FROM opinion o
          LEFT JOIN opinion_type ot
          ON ot.id = o.opinion_type_id
          LEFT JOIN step os
          ON os.id = o.step_id
          LEFT JOIN consultation_step_type cst
          ON cst.id = os.consultation_step_type_id
          LEFT JOIN consultation_step_type otcst
          ON otcst.id = ot.consultation_step_type_id
          WHERE cst.id != otcst.id
        "
        );
        foreach ($opinions as $opinion) {
            // Get correct opinion type
            $ot = $this->connection->fetchAll(
                "
                SELECT ot.id
                FROM opinion_type ot
                WHERE ot.consultation_step_type_id = ?
                AND ot.slug = ?
            ",
                [$opinion['o_cst_id'], $opinion['ot_slug']]
            );
            if (count($ot) < 1) {
                echo "Error, opinion type for opinion " .
                    $opinion['o_id'] .
                    " can not be resolved. Please check it.\n";
            } else {
                echo "Updating opinion " .
                    $opinion['o_id'] .
                    " with opinion type " .
                    $ot[0]['id'] .
                    ".\n";
                $this->connection->update(
                    'opinion',
                    ['opinion_type_id' => $ot[0]['id']],
                    ['id' => $opinion['o_id']]
                );
            }
        }

        // Then fix opinion types with non unique slug
        $opinionTypesSlugs = $this->connection->fetchAll(
            "
            SELECT ot.slug as slug, count(ot.id) as count
            FROM opinion_type ot
            GROUP BY ot.slug
        "
        );
        foreach ($opinionTypesSlugs as $ots) {
            if ($ots['count'] > 1) {
                // Since we need to use doctrine this migration can break.
                echo "Error, multiple (" .
                    $ots['count'] .
                    ") opinion types with slug \"" .
                    $ots['slug'] .
                    "\". Attempting to fix it.\n";
                $em = $this->container->get('doctrine.orm.entity_manager');
                $opinionTypes = $em
                    ->getRepository('CapcoAppBundle:OpinionType')
                    ->findBy(['slug' => $ots['slug']]);
                foreach ($opinionTypes as $ot) {
                    $ot->setSlug(null);
                }
                $em->flush();
            }
        }
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
