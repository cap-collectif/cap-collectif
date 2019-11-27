<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Show\ShowMapper;

class NewsletterSubscriptionAdmin extends AbstractAdmin
{
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'email',
    ];

    public function getFeatures()
    {
        return ['newsletter'];
    }

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('email', null, [
                'label' => 'share.mail',
            ])
            ->add('isEnabled', null, [
                'label' => 'admin.fields.newsletter_subscription.is_enabled',
            ])
            ->add('createdAt', null, [
                'label' => 'global.creation',
            ]);
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
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
                'actions' => [
                    'show' => [],
                    'edit' => [],
                    'delete' => [],
                ],
            ]);
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('email', null, [
                'label' => 'share.mail',
            ])
            ->add('isEnabled', null, [
                'label' => 'admin.fields.newsletter_subscription.is_enabled',
                'required' => false,
            ]);
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('email', null, [
                'label' => 'share.mail',
            ])
            ->add('isEnabled', null, [
                'editable' => true,
                'label' => 'admin.fields.newsletter_subscription.is_enabled',
            ])
            ->add('createdAt', null, [
                'label' => 'global.creation',
            ]);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
    }
}
