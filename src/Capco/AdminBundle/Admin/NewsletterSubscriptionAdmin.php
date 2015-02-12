<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class NewsletterSubscriptionAdmin extends Admin
{
    protected $datagridValues = array(
        '_sort_order' => 'ASC',
        '_sort_by' => 'email'
    );

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('email', null, array(
                'label' => 'admin.fields.newsletter_subscription.email',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.newsletter_subscription.is_enabled',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.newsletter_subscription.created_at',
            ))
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->addIdentifier('email', null, array(
                'label' => 'admin.fields.newsletter_subscription.email',
            ))
            ->add('isEnabled', null, array(
                'editable' => true,
                'label' => 'admin.fields.newsletter_subscription.is_enabled',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.newsletter_subscription.created_at',
            ))
            ->add('_action', 'actions', array(
                'actions' => array(
                    'show' => array(),
                    'edit' => array(),
                    'delete' => array(),
                )
            ))
        ;
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('email', null, array(
                'label' => 'admin.fields.newsletter_subscription.email',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.newsletter_subscription.is_enabled',
                'required' => false,
            ))
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('email', null, array(
                'label' => 'admin.fields.newsletter_subscription.email',
            ))
            ->add('isEnabled', null, array(
                'editable' => true,
                'label' => 'admin.fields.newsletter_subscription.is_enabled',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.newsletter_subscription.created_at',
            ))
        ;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
    }

    public function getFeatures()
    {
        return array(
            'newsletter',
        );
    }
}
