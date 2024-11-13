<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Form\Type\PurifiedTextType;
use FOS\CKEditorBundle\Form\Type\CKEditorType;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Form\Type\ModelListType;
use Sonata\AdminBundle\Route\RouteCollectionInterface;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;

class PageAdmin extends AbstractAdmin
{
    protected ?string $classnameLabel = 'page';
    protected array $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'title',
    ];

    // Fields to be shown on create/edit forms
    protected function configureFormFields(FormMapper $form): void
    {
        $form
            // We can no more use `null` here because sonata
            // can not guess type on translation entity
            // but it's propably better like that :-)
            ->add('title', TextType::class, [
                'label' => 'global.title',
            ])
        ;

        if ($this->getSubject()->getId()) {
            $form->add('slug', TextType::class, [
                'disabled' => true,
                'attr' => ['readonly' => true],
                'label' => 'global.link',
            ]);
        }

        $form
            ->add('body', CKEditorType::class, [
                'label' => 'global.contenu',
                'config_name' => 'admin_editor',
            ])
            ->add('isEnabled', null, [
                'label' => 'global.published',
                'required' => false,
            ])
            ->end()
        ;
        $form
            ->with('admin.fields.page.advanced')
            ->add('metaDescription', PurifiedTextType::class, [
                'label' => 'global.meta.description',
                'required' => false,
                'help' => 'admin.help.metadescription',
                'strip_tags' => true,
                'purify_html' => true,
                'purify_html_profile' => 'admin',
            ])
            ->add('cover', ModelListType::class, [
                'required' => false,
                'label' => 'global.image',
                'help' => 'admin.help.social_network_thumbnail',
            ])
            ->add('customCode', TextareaType::class, [
                'label' => 'admin.customcode',
                'required' => false,
                'help' => 'admin.help.customcode',
                'attr' => [
                    'rows' => 10,
                    'placeholder' => '<script type="text/javascript"> </script>',
                ],
            ])
            ->end()
        ;
    }

    // Fields to be shown on filter forms
    protected function configureDatagridFilters(DatagridMapper $filter): void
    {
        $filter
            ->add('title', null, [
                'label' => 'global.title',
            ])
            ->add('isEnabled', null, [
                'label' => 'global.published',
            ])
            ->add('MenuItems', null, [
                'label' => 'admin.fields.page.menu_items',
            ])
            ->add('updatedAt', null, [
                'label' => 'global.maj',
            ])
        ;
    }

    // Fields to be shown on lists
    protected function configureListFields(ListMapper $list): void
    {
        $list
            ->addIdentifier('title', null, [
                'label' => 'global.title',
            ])
            ->add('slug', null, [
                'label' => 'global.link',
            ])
            ->add('isEnabled', null, [
                'editable' => true,
                'label' => 'global.published',
            ])
            ->add('MenuItems', null, [
                'label' => 'admin.fields.page.menu_items',
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
            ])
        ;
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->clearExcept(['create', 'delete', 'list', 'edit']);
    }

    protected function configure(): void
    {
        $this->setTemplate('edit', '@CapcoAdmin/CRUD/edit.html.twig');
    }
}
