<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\FooterSocialNetwork;
use Capco\AppBundle\Repository\FooterSocialNetworkRepository;
use Doctrine\ORM\EntityManagerInterface;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollectionInterface;
use Sonata\AdminBundle\Show\ShowMapper;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;

class FooterSocialNetworkAdmin extends AbstractAdmin
{
    protected ?string $classnameLabel = 'social_network';
    protected array $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'title',
    ];

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName,
        private readonly EntityManagerInterface $entityManager
    ) {
        parent::__construct($code, $class, $baseControllerName);
    }

    public function postUpdate($object): void
    {
        $cacheDriver = $this->entityManager->getConfiguration()->getResultCacheImpl();
        $cacheDriver->delete(FooterSocialNetworkRepository::getEnabledCacheKey());
    }

    protected function configureDatagridFilters(DatagridMapper $filter): void
    {
        $filter
            ->add('title', null, [
                'label' => 'global.title',
            ])
            ->add('isEnabled', null, [
                'label' => 'global.published',
            ])
            ->add('link', null, [
                'label' => 'global.link',
            ])
            ->add('style', null, [
                'label' => 'admin.fields.footer_social_network.style',
            ])
            ->add('position', null, [
                'label' => 'global.position',
            ])
            ->add('updatedAt', null, [
                'label' => 'global.maj',
            ])
        ;
    }

    protected function configureListFields(ListMapper $list): void
    {
        $list
            ->addIdentifier('title', null, [
                'label' => 'global.title',
            ])
            ->add('isEnabled', null, [
                'editable' => true,
                'label' => 'global.published',
            ])
            ->add('link', null, [
                'label' => 'global.link',
            ])
            ->add('style', 'string', [
                'template' => '@CapcoAdmin/FooterSocialNetwork/style_list_field.html.twig',
                'label' => 'admin.fields.footer_social_network.style',
            ])
            ->add('position', null, [
                'label' => 'global.position',
            ])
            ->add('updatedAt', null, [
                'label' => 'global.maj',
            ])
            ->add('_action', 'actions', [
                'label' => 'link_actions',
                'actions' => [
                    'edit' => [],
                    'delete' => [],
                ],
            ])
        ;
    }

    protected function configureFormFields(FormMapper $form): void
    {
        $form
            ->add('title', null, [
                'label' => 'global.title',
            ])
            ->add('isEnabled', null, [
                'label' => 'global.published',
                'required' => false,
            ])
            ->add('link', null, [
                'label' => 'global.link',
            ])
            ->add('style', ChoiceType::class, [
                'choices' => FooterSocialNetwork::$socialIcons,
                'label' => 'admin.fields.footer_social_network.style',
            ])
            ->add('position', null, [
                'label' => 'global.position',
            ])
        ;
    }

    protected function configureShowFields(ShowMapper $show): void
    {
        $show
            ->add('title', null, [
                'label' => 'global.title',
            ])
            ->add('isEnabled', null, [
                'label' => 'global.published',
            ])
            ->add('link', null, [
                'label' => 'global.link',
            ])
            ->add('style', null, [
                'template' => '@CapcoAdmin/FooterSocialNetwork/style_show_field.html.twig',
                'label' => 'admin.fields.footer_social_network.style',
            ])
            ->add('position', null, [
                'label' => 'global.position',
            ])
            ->add('createdAt', null, [
                'label' => 'global.creation',
            ])
            ->add('updatedAt', null, [
                'label' => 'global.maj',
            ])
        ;
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->clearExcept(['list', 'create', 'edit', 'delete']);
    }

    protected function configure(): void
    {
        $this->setTemplate('edit', '@CapcoAdmin/CRUD/edit.html.twig');
    }
}
