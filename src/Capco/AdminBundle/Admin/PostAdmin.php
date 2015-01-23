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
        $subject = $this->getSubject();
        $publishedAt = null;

        if ($subject !== null){
            $publishedAt = $subject->getPublishedAt();
        }

        $formMapper
            ->add('title', null, array(
                'label' => 'admin.fields.blog_post.title',
            ))
            ->add('abstract', null, array(
                'label' => 'admin.fields.blog_post.abstract',
            ))
            ->add('body', null, array(
                'attr' => array('class' => 'ckeditor'),
                'label' => 'admin.fields.blog_post.body',
            ))
            ->add('isPublished', null, array(
                'label' => 'admin.fields.blog_post.is_published',
            ))
            ->add('publishedAt', 'sonata_type_datetime_picker', array(
                'required' => false,
                'mapped' => false,
                'datepicker_use_button' => false,
                'data' => $publishedAt,
                'label' => 'admin.fields.blog_post.published_at',
            ))
            ->add('Authors', null, array(
                'label' => 'admin.fields.blog_post.authors',
                'required' => false,
                'by_reference' => false,
            ))
        ;
    }
}
