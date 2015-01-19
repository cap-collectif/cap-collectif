<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Capco\AppBundle\Entity\FooterSocialNetwork;
use Sonata\AdminBundle\Route\RouteCollection;

class FooterSocialNetworkAdmin extends Admin
{

    protected $datagridValues = array(
        '_sort_order' => 'ASC',
        '_sort_by' => 'title'
    );

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, array(
                'label' => 'admin.fields.footer_social_network.title',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.footer_social_network.is_enabled',
            ))
            ->add('link', null, array(
                'label' => 'admin.fields.footer_social_network.link',
            ))
            ->add('style', null, array(
                'label' => 'admin.fields.footer_social_network.style',
            ))
            ->add('position', null, array(
                'label' => 'admin.fields.footer_social_network.position',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.footer_social_network.updated_at',
            ))
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->addIdentifier('title', null, array(
                'label' => 'admin.fields.footer_social_network.title',
            ))
            ->add('isEnabled', null, array(
                'editable' => true,
                'label' => 'admin.fields.footer_social_network.is_enabled',
            ))
            ->add('link', null, array(
                'label' => 'admin.fields.footer_social_network.link',
            ))
            ->add('style', 'string', array(
                'template'=>'CapcoAdminBundle:FooterSocialNetwork:style_list_field.html.twig',
                'label' => 'admin.fields.footer_social_network.style',
            ))
            ->add('position', null, array(
                'label' => 'admin.fields.footer_social_network.position',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.footer_social_network.updated_at',
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
            ->add('title', null, array(
                'label' => 'admin.fields.footer_social_network.title',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.footer_social_network.is_enabled',
                'required' => false,
            ))
            ->add('link', null, array(
                'label' => 'admin.fields.footer_social_network.link',
            ))
            ->add('style', 'choice', array(
                'choices'=>FooterSocialNetwork::$socialIcons,
                'label' => 'admin.fields.footer_social_network.style',
            ))
            ->add('position', null, array(
                'label' => 'admin.fields.footer_social_network.position',
            ))
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title', null, array(
                'label' => 'admin.fields.footer_social_network.title',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.footer_social_network.is_enabled',
            ))
            ->add('link', null, array(
                'label' => 'admin.fields.footer_social_network.link',
            ))
            ->add('style', null, array(
                'template' => 'CapcoAdminBundle:FooterSocialNetwork:style_show_field.html.twig',
                'label' => 'admin.fields.footer_social_network.style',
            ))
            ->add('position', null, array(
                'label' => 'admin.fields.footer_social_network.position',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.footer_social_network.created_at',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.footer_social_network.updated_at',
            ))
        ;
    }
}
