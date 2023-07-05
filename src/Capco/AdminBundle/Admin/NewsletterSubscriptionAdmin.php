<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollectionInterface;
use Sonata\AdminBundle\Show\ShowMapper;

class NewsletterSubscriptionAdmin extends AbstractAdmin
{
    protected ?string $classnameLabel = 'newsletter_subscription';
    protected array $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'email',
    ];

    public function getFeatures(): array
    {
        return ['newsletter'];
    }

    public function getExportFormats(): array
    {
        return ['csv'];
    }

    protected function configureDatagridFilters(DatagridMapper $filter): void
    {
        $filter
            ->add('email', null, [
                'label' => 'share.mail',
            ])
            ->add('isEnabled', null, [
                'label' => 'admin.fields.newsletter_subscription.is_enabled',
            ])
            ->add('createdAt', null, [
                'label' => 'global.creation',
            ])
        ;
    }

    protected function configureListFields(ListMapper $list): void
    {
        $list
            ->addIdentifier('email', null, [
                'label' => 'share.mail',
            ])
            ->add('isEnabled', null, [
                'editable' => true,
                'label' => 'admin.fields.newsletter_subscription.is_enabled',
            ])
            ->add('createdAt', null, [
                'label' => 'global.creation',
            ])
            ->add('_action', 'actions', [
                'label' => 'link_actions',
                'actions' => [
                    'show' => [],
                    'edit' => [],
                    'delete' => [],
                ],
            ])
        ;
    }

    protected function configureFormFields(FormMapper $form): void
    {
        $form
            ->add('email', null, [
                'label' => 'share.mail',
            ])
            ->add('isEnabled', null, [
                'label' => 'admin.fields.newsletter_subscription.is_enabled',
                'required' => false,
            ])
        ;
    }

    protected function configureShowFields(ShowMapper $show): void
    {
        $show
            ->add('email', null, [
                'label' => 'share.mail',
            ])
            ->add('isEnabled', null, [
                'editable' => true,
                'label' => 'admin.fields.newsletter_subscription.is_enabled',
            ])
            ->add('createdAt', null, [
                'label' => 'global.creation',
            ])
        ;
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->clearExcept(['list', 'create', 'edit', 'delete', 'export']);
    }
}
