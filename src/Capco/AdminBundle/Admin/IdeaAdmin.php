<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

class IdeaAdmin extends Admin
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
                'label' => 'admin.fields.idea.title',
            ))
        ;

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('themes')) {
            $datagridMapper->add('Theme', null, array(
                'label' => 'admin.fields.idea.theme',
            ));
        }

        $datagridMapper
            ->add('voteCount', null, array(
                'label' => 'admin.fields.idea.vote_count',
            ))
            ->add('Author', null, array(
                'label' => 'admin.fields.idea.author',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.idea.is_enabled',
            ))
            ->add('isTrashed', null, array(
                'label' => 'admin.fields.idea.is_trashed',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.idea.updated_at',
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
                'label' => 'admin.fields.idea.title',
            ))
        ;

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('themes')) {
            $listMapper->add('Theme', null, array(
                'label' => 'admin.fields.idea.theme',
            ));
        }

        $listMapper
            ->add('voteCount', null, array(
                'label' => 'admin.fields.idea.vote_count',
            ))
            ->add('Author', 'sonata_type_model', array(
                'label' => 'admin.fields.idea.author',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.idea.is_enabled',
                'editable' => true,
            ))
            ->add('isTrashed', null, array(
                'label' => 'admin.fields.idea.is_trashed',
                'editable' => true,
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.idea.updated_at',
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
                'label' => 'admin.fields.idea.title',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.idea.is_enabled',
                'required' => false,
            ))
            ->add('Author', 'sonata_type_model', array(
                'label' => 'admin.fields.idea.author',
            ))
        ;

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('themes')) {
            $formMapper->add('Theme', null, array(
                'label' => 'admin.fields.idea.theme',
                'required' => false,
            ));
        }

        $formMapper
            ->add('body', null, array(
                'label' => 'admin.fields.idea.body',
                'attr' => array('class' => 'ckeditor'),
            ))
            ->add('Media', 'sonata_type_model_list', array(
                'label' => 'admin.fields.idea.media',
                'required' => false,
            ), array(
                'link_parameters' => array(
                    'context' => 'default',
                    'hide_context' => true,
                    'provider' => 'sonata.media.provider.image',
                )
            ))
            ->add('isTrashed', null, array(
                'label' => 'admin.fields.idea.is_trashed',
                'required' => false,
            ))
            ->add('trashedReason', null, array(
                'label' => 'admin.fields.idea.trashed_reason',
                'required' => false,
            ))
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $subject = $this->getSubject();

        $showMapper
            ->add('title', null, array(
                'label' => 'admin.fields.idea.title',
            ))
            ->add('body', null, array(
                'label' => 'admin.fields.idea.body',
            ));

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('themes')) {
            $showMapper->add('Theme', null, array(
                'label' => 'admin.fields.idea.theme',
            ));
        }

        $showMapper
            ->add('voteCount', null, array(
                'label' => 'admin.fields.idea.vote_count',
            ))
            ->add('Author', null, array(
                'label' => 'admin.fields.idea.author',
            ))
            ->add('Media', 'sonata_media_type', array(
                'template' => 'CapcoAdminBundle:Idea:media_show_field.html.twig',
                'provider' => 'sonata.media.provider.image',
                'label' => 'admin.fields.idea.media',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.idea.is_enabled',
                'editable' => true,
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.idea.updated_at',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.idea.created_at',
            ))
            ->add('isTrashed', null, array(
                'label' => 'admin.fields.idea.is_trashed',
            ))
        ;

        if ($subject->getIsTrashed()) {
            $showMapper
                ->add('trashedAt', null, array(
                    'label' => 'admin.fields.idea.trashed_at',
                ))
                ->add('trashedReason', null, array(
                    'label' => 'admin.fields.idea.trashed_reason',
                ))
            ;
        }
    }

    public function getFeatures()
    {
        return array(
            'ideas',
        );
    }
}
