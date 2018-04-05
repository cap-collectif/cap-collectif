<?php

namespace Capco\AdminBundle\Controller;

use Sonata\AdminBundle\Admin\AdminInterface;
use Sonata\AdminBundle\Controller\CRUDController as Controller;
use Sonata\AdminBundle\Filter\FilterInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class CRUDController extends Controller
{
    /**
     * @param Request $request
     * @param $conditions
     *
     * @return JsonResponse
     *                      Method from Sonata Admin HelperController used to fetch items in autocompletion.
     *                      Extended to allow additional conditions in query
     */
    protected function retrieveAutocompleteItems(Request $request, $conditions = [])
    {
        $pool = $this->get('sonata.admin.pool');
        $admin = $pool->getInstance($request->get('admin_code'));
        $admin->setRequest($request);
        $context = $request->get('_context', '');

        if ($context === 'filter' && false === $admin->isGranted('LIST')) {
            throw $this->createAccessDeniedException();
        }

        if ($context !== 'filter'
            && false === $admin->isGranted('CREATE')
            && false === $admin->isGranted('EDIT')
        ) {
            throw $this->createAccessDeniedException();
        }

        // subject will be empty to avoid unnecessary database requests and keep autocomplete function fast
        $admin->setSubject($admin->getNewInstance());

        if ($context === 'filter') {
            // filter
            $fieldDescription = $this->retrieveFilterFieldDescription($admin, $request->get('field'));
            $filterAutocomplete = $admin->getDatagrid()->getFilter($fieldDescription->getName());

            $property = $filterAutocomplete->getFieldOption('property');
            $callback = $filterAutocomplete->getFieldOption('callback');
            $minimumInputLength = $filterAutocomplete->getFieldOption('minimum_input_length', 3);
            $itemsPerPage = $filterAutocomplete->getFieldOption('items_per_page', 10);
            $reqParamPageNumber = $filterAutocomplete->getFieldOption('req_param_name_page_number', '_page');
            $toStringCallback = $filterAutocomplete->getFieldOption('to_string_callback');
        } else {
            // create/edit form
            $fieldDescription = $this->retrieveFormFieldDescription($admin, $request->get('field'));
            $formAutocomplete = $admin->getForm()->get($fieldDescription->getName());

            if ($formAutocomplete->getConfig()->getAttribute('disabled')) {
                throw $this->createAccessDeniedException('Autocomplete list can`t be retrieved because the form element is disabled or read_only.');
            }

            $property = $formAutocomplete->getConfig()->getAttribute('property');
            $callback = $formAutocomplete->getConfig()->getAttribute('callback');
            $minimumInputLength = $formAutocomplete->getConfig()->getAttribute('minimum_input_length');
            $itemsPerPage = $formAutocomplete->getConfig()->getAttribute('items_per_page');
            $reqParamPageNumber = $formAutocomplete->getConfig()->getAttribute('req_param_name_page_number');
            $toStringCallback = $formAutocomplete->getConfig()->getAttribute('to_string_callback');
        }

        $searchText = $request->get('q');

        $targetAdmin = $fieldDescription->getAssociationAdmin();

        // check user permission
        if (false === $targetAdmin->isGranted('LIST')) {
            throw $this->createAccessDeniedException();
        }

        if (mb_strlen($searchText, 'UTF-8') < $minimumInputLength) {
            return new JsonResponse(['status' => 'KO', 'message' => 'Too short search string.'], 403);
        }

        $targetAdmin->setPersistFilters(false);
        $datagrid = $targetAdmin->getDatagrid();

        if ($callback !== null) {
            if (!is_callable($callback)) {
                throw new \RuntimeException('Callback does not contain callable function.');
            }

            $callback($targetAdmin, $property, $searchText);
        } else {
            if (is_array($property)) {
                // multiple properties
                foreach ($property as $prop) {
                    if (!$datagrid->hasFilter($prop)) {
                        throw new \RuntimeException(sprintf('To retrieve autocomplete items, you should add filter "%s" to "%s" in configureDatagridFilters() method.', $prop, get_class($targetAdmin)));
                    }

                    $filter = $datagrid->getFilter($prop);
                    $filter->setCondition(FilterInterface::CONDITION_OR);

                    $datagrid->setValue($prop, null, $searchText);
                }
            } else {
                if (!$datagrid->hasFilter($property)) {
                    throw new \RuntimeException(sprintf('To retrieve autocomplete items, you should add filter "%s" to "%s" in configureDatagridFilters() method.', $property, get_class($targetAdmin)));
                }

                $datagrid->setValue($property, null, $searchText);
            }
        }

        foreach ($conditions as $field => $value) {
            if (!$datagrid->hasFilter($field)) {
                throw new \RuntimeException(sprintf('To retrieve autocomplete items, you should add filter "%s" to "%s" in configureDatagridFilters() method.', $field, get_class($targetAdmin)));
            }
            $datagrid->setValue($field, null, $value);
        }

        $datagrid->setValue('_per_page', null, $itemsPerPage);
        $datagrid->setValue('_page', null, $request->query->get($reqParamPageNumber, 1));

        $datagrid->buildPager();

        $pager = $datagrid->getPager();

        $items = [];
        $results = $pager->getResults();

        foreach ($results as $entity) {
            if ($toStringCallback !== null) {
                if (!is_callable($toStringCallback)) {
                    throw new \RuntimeException('Option "to_string_callback" does not contain callable function.');
                }

                $label = call_user_func($toStringCallback, $entity, $property);
            } else {
                $resultMetadata = $targetAdmin->getObjectMetadata($entity);
                $label = $resultMetadata->getTitle();
            }

            $items[] = [
                'id' => $admin->id($entity),
                'label' => $label,
            ];
        }

        return new JsonResponse([
            'status' => 'OK',
            'more' => !$pager->isLastPage(),
            'items' => $items,
        ]);
    }

    /**
     * @param AdminInterface $admin
     * @param $field
     *
     * @return \Sonata\AdminBundle\Admin\FieldDescriptionInterface
     *                                                             Method from Sonata Admin HelperController
     */
    protected function retrieveFormFieldDescription(AdminInterface $admin, $field)
    {
        $admin->getFormFieldDescriptions();

        $fieldDescription = $admin->getFormFieldDescription($field);

        if (!$fieldDescription) {
            throw new \RuntimeException(sprintf('The field "%s" does not exist.', $field));
        }

        if ($fieldDescription->getType() !== 'sonata_type_model_autocomplete') {
            throw new \RuntimeException(sprintf('Unsupported form type "%s" for field "%s".', $fieldDescription->getType(), $field));
        }

        if (null === $fieldDescription->getTargetEntity()) {
            throw new \RuntimeException(sprintf('No associated entity with field "%s".', $field));
        }

        return $fieldDescription;
    }
}
