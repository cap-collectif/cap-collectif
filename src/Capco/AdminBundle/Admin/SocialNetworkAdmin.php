<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Capco\AppBundle\Entity\SocialNetwork;

class SocialNetworkAdmin extends Admin
{
    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('position')
            ->add('isEnabled')
            ->add('media')
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->add('title')
            ->add('position')
            ->add('isEnabled', null, array('editable' => true))
            ->add('createdAt')
            ->add('media', 'sonata_media_type', array(
                'template' => 'CapcoAdminBundle:SocialNetwork:media_list_field.html.twig',
                'provider' => 'sonata.media.provider.image'))
            ->add('_action', 'actions', array(
                'actions' => array(
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
            ->add('title')
            ->add('link')
            ->add('position')
            ->add('isEnabled')
            ->add('media', 'sonata_type_model')
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title')
            ->add('link')
            ->add('position')
            ->add('isEnabled')
            ->add('createdAt')
            ->add('updatedAt')
        ;
    }
}
