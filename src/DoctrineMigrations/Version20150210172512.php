<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Capco\AppBundle\Entity\SiteParameter;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150210172512 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    /**
     * Sets the Container.
     *
     * @param ContainerInterface|null $container A ContainerInterface instance or null
     *
     * @api
     */
    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
    }

    public function postUp(Schema $schema): void
    {
        $em = $this->container->get('doctrine.orm.entity_manager');

        $parameterTypes = SiteParameter::$types;

        $newTypeSettings = array(
            'homepage.jumbotron.title' => 'simple_text',
            'homepage.jumbotron.body' => 'rich_text',
            'homepage.jumbotron.button' => 'simple_text',
            'homepage.jumbotron.button_link' => 'intern_url',
            'homepage.jumbotron2.title' => 'simple_text',
            'homepage.jumbotron2.body' => 'rich_text',
            'footer.text.title' => 'simple_text',
            'footer.text.body' => 'rich_text',
            'consultations.jumbotron.title' => 'simple_text',
            'consultations.jumbotron.body' => 'rich_text',
            'consultations.content.body' => 'rich_text',
            'ideas.jumbotron.title' => 'simple_text',
            'ideas.jumbotron.body' => 'rich_text',
            'ideas.content.body' => 'rich_text',
            'ideas.trashed.jumbotron.title' => 'simple_text',
            'ideas.trashed.content.body' => 'rich_text',
            'themes.jumbotron.title' => 'simple_text',
            'themes.jumbotron.body' => 'rich_text',
            'themes.content.body' => 'rich_text',
            'contact.jumbotron.body' => 'rich_text',
            'contact.content.body' => 'rich_text',
            'contact.content.address' => 'rich_text',
            'contact.content.phone_number' => 'tel',
            'consultations.pagination' => 'integer',
            'ideas.pagination' => 'integer',
            'themes.pagination' => 'integer',
            'signin.cgu.name' => 'simple_text',
            'signin.cgu.link' => 'intern_url',
            'admin.mail.notifications' => 'email',
            'admin.mail.contact' => 'email',
            'global.site.fullname' => 'simple_text',
            'blog.pagination.size' => 'integer',
            'blog.jumbotron.body' => 'rich_text',
            'blog.jumbotron.title' => 'simple_text',
            'blog.disqus.username' => 'simple_text',
            'global.site.embed_js' => 'javascript',
        );

        foreach ($newTypeSettings as $key => $type) {
            $em = $this->container->get('doctrine.orm.entity_manager');

            $query = $em->createQuery(
                "SELECT sp.id FROM Capco\AppBundle\Entity\SiteParameter sp WHERE sp.keyname = :keyname"
            );
            $query->setParameter('keyname', $key);
            $parameter = $query->getOneOrNullResult();

            if (null != $parameter) {
                $this->connection->update(
                    'site_parameter',
                    array('type' => $parameterTypes[$type]),
                    array('id' => $parameter['id'])
                );
            }
        }

        $query = $em->createQuery(
            "SELECT sp.id FROM Capco\AppBundle\Entity\SiteParameter sp WHERE sp.keyname = :keyname"
        );
        $query->setParameter('keyname', 'global.site.embed_js');
        $newParameter = $query->getOneOrNullResult();
        if (null == $newParameter) {
            $date = (new \DateTime())->format('Y-m-d H:i:s');
            $this->connection->insert('site_parameter', array(
                'keyname' => 'global.site.embed_js',
                'title' => 'Script à insérer dans les pages',
                'value' => '',
                'position' => 2,
                'type' => $parameterTypes['javascript'],
                'created_at' => $date,
                'updated_at' => $date,
            ));
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }

    public function postDown(Schema $schema): void
    {
        $em = $this->container->get('doctrine.orm.entity_manager');
        $query = $em->createQuery(
            "SELECT sp.id FROM Capco\AppBundle\Entity\SiteParameter sp WHERE sp.keyname = :keyname"
        );
        $query->setParameter('keyname', 'global.site.embed_js');
        $newParameter = $query->getOneOrNullResult();
        if (null != $newParameter) {
            $this->connection->delete('site_parameter', array('id' => $newParameter['id']));
        }
    }
}
