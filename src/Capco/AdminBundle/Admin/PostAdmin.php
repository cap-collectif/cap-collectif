<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

class PostAdmin extends Admin
{
    protected $datagridValues = array(
        '_sort_order' => 'DESC',
        '_sort_by' => 'createdAt'
    );

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, array(
                'label' => 'admin.fields.blog_post.title',
            ))
            ->add('body', null, array(
                'label' => 'admin.fields.blog_post.body',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.blog_post.created_at',
            ))
            ->add('isPublished', null, array(
                'label' => 'admin.fields.blog_post.is_published',
            ))
            ->add('isCommentable', null, array(
                'label' => 'admin.fields.blog_post.is_commentable',
            ))
            ->add('publishedAt', null, array(
                'label' => 'admin.fields.blog_post.published_at',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.blog_post.title',
            ))
            ->add('Authors', null, array(
                'label' => 'admin.fields.blog_post.authors',
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
                'label' => 'admin.fields.blog_post.title',
            ))
            ->add('Authors', 'sonata_type_collection', array(
                'label' => 'admin.fields.blog_post.authors',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.blog_post.created_at',
            ))
            ->add('isPublished', null, array(
                'editable' => true,
                'label' => 'admin.fields.blog_post.is_published',
            ))
            ->add('publishedAt', null, array(
                'label' => 'admin.fields.blog_post.published_at',
            ))
            ->add('isCommentable', null, array(
                'label' => 'admin.fields.blog_post.is_commentable',
                'editable' => true,
            ))
            ->add('commentsCount', null, array(
                'label' => 'admin.fields.blog_post.comments_count',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.blog_post.updated_at',
            ))
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
            ->add('title', null, array(
                'label' => 'admin.fields.blog_post.title',
            ))
            ->add('Authors', null, array(
                'label' => 'admin.fields.blog_post.authors',
                'required' => false,
                'by_reference' => false,
            ))
            ->add('isPublished', null, array(
                'label' => 'admin.fields.blog_post.is_published',
                'required' => false,
            ))
            ->add('publishedAt', 'sonata_type_datetime_picker', array(
                'required' => false,
                'label' => 'admin.fields.blog_post.published_at',
                'format' => 'dd/MM/yyyy HH:mm',
                'attr' => array(
                    'data-date-format' => 'DD/MM/YYYY HH:mm'
                ),
            ))
            ->add('abstract', null, array(
                'label' => 'admin.fields.blog_post.abstract',
            ))
            ->add('body', null, array(
                'label' => 'admin.fields.blog_post.body',
                'attr' => array('class' => 'ckeditor'),
            ))
            ->add('Media', 'sonata_type_model_list', array('required' => false), array(
                'link_parameters' => array(
                    'context' => 'default',
                    'hide_context' => true
                )
            ))
            ->add('isCommentable', null, array(
                'label' => 'admin.fields.blog_post.is_commentable',
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
            ->add('title', null, array(
                'label' => 'admin.fields.blog_post.title',
            ))
            ->add('Authors', null, array(
                'label' => 'admin.fields.blog_post.authors',
            ))
            ->add('abstract', null, array(
                'label' => 'admin.fields.blog_post.abstract',
            ))
            ->add('body', 'ckeditor', array(
                'label' => 'admin.fields.blog_post.body',
                'config_name' => 'admin_editor',
            ))
            ->add('Media', 'sonata_media_type', array(
                'template' => 'CapcoAdminBundle:Post:media_show_field.html.twig',
                'provider' => 'sonata.media.provider.image',
                'label' => 'admin.fields.blog_post.media',
            ))
            ->add('isPublished', null, array(
                'label' => 'admin.fields.blog_post.is_published',
            ))
            ->add('publishedAt', null, array(
                'label' => 'admin.fields.blog_post.published_at',
            ))
            ->add('isCommentable', null, array(
                'label' => 'admin.fields.blog_post.is_commentable',
            ))
            ->add('commentsCount', null, array(
                'label' => 'admin.fields.blog_post.comments_count',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.blog_post.updated_at',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.blog_post.created_at',
            ))
        ;
    }

    public function getFeatures()
    {
        return array(
            'blog',
        );
    }
}
