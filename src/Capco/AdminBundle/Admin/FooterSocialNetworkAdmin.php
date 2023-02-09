<?php

namespace Capco\AdminBundle\Admin;

use Doctrine\ORM\EntityManagerInterface;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollectionInterface;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Capco\AppBundle\Entity\FooterSocialNetwork;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Capco\AppBundle\Repository\FooterSocialNetworkRepository;

class FooterSocialNetworkAdmin extends AbstractAdmin
{
    protected ?string $classnameLabel = 'social_network';
    protected array $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'title',
    ];

    private EntityManagerInterface $entityManager;

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName,
        EntityManagerInterface $entityManager
    ) {
        parent::__construct($code, $class, $baseControllerName);
        $this->entityManager = $entityManager;
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
            ]);
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
                'template' => 'CapcoAdminBundle:FooterSocialNetwork:style_list_field.html.twig',
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
            ]);
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
            ]);
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
                'template' => 'CapcoAdminBundle:FooterSocialNetwork:style_show_field.html.twig',
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
            ]);
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->clearExcept(['list', 'create', 'edit', 'delete']);
    }
}
