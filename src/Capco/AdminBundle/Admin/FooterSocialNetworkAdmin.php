<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\FooterSocialNetwork;
use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

class FooterSocialNetworkAdmin extends AbstractAdmin
{
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'title',
    ];

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, [
                'label' => 'admin.fields.footer_social_network.title',
            ])
            ->add('isEnabled', null, [
                'label' => 'admin.fields.footer_social_network.is_enabled',
            ])
            ->add('link', null, [
                'label' => 'admin.fields.footer_social_network.link',
            ])
            ->add('style', null, [
                'label' => 'admin.fields.footer_social_network.style',
            ])
            ->add('position', null, [
                'label' => 'admin.fields.footer_social_network.position',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.footer_social_network.updated_at',
            ]);
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('title', null, [
                'label' => 'admin.fields.footer_social_network.title',
            ])
            ->add('isEnabled', null, [
                'editable' => true,
                'label' => 'admin.fields.footer_social_network.is_enabled',
            ])
            ->add('link', null, [
                'label' => 'admin.fields.footer_social_network.link',
            ])
            ->add('style', 'string', [
                'template' => 'CapcoAdminBundle:FooterSocialNetwork:style_list_field.html.twig',
                'label' => 'admin.fields.footer_social_network.style',
            ])
            ->add('position', null, [
                'label' => 'admin.fields.footer_social_network.position',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.footer_social_network.updated_at',
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
            ->add('title', null, [
                'label' => 'admin.fields.footer_social_network.title',
            ])
            ->add('isEnabled', null, [
                'label' => 'admin.fields.footer_social_network.is_enabled',
                'required' => false,
            ])
            ->add('link', null, [
                'label' => 'admin.fields.footer_social_network.link',
            ])
            ->add('style', 'choice', [
                'choices' => FooterSocialNetwork::$socialIcons,
                'label' => 'admin.fields.footer_social_network.style',
            ])
            ->add('position', null, [
                'label' => 'admin.fields.footer_social_network.position',
            ]);
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title', null, [
                'label' => 'admin.fields.footer_social_network.title',
            ])
            ->add('isEnabled', null, [
                'label' => 'admin.fields.footer_social_network.is_enabled',
            ])
            ->add('link', null, [
                'label' => 'admin.fields.footer_social_network.link',
            ])
            ->add('style', null, [
                'template' => 'CapcoAdminBundle:FooterSocialNetwork:style_show_field.html.twig',
                'label' => 'admin.fields.footer_social_network.style',
            ])
            ->add('position', null, [
                'label' => 'admin.fields.footer_social_network.position',
            ])
            ->add('createdAt', null, [
                'label' => 'admin.fields.footer_social_network.created_at',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.footer_social_network.updated_at',
            ]);
    }
}
