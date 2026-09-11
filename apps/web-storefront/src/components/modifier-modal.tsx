'use client';

import React, { useState, useMemo } from 'react';
import type {
  Product,
  ModifierGroup,
  ModifierOption,
  CartItem,
  SelectedModifier,
} from '@restaurantes/config';
import { formatCurrency } from '@restaurantes/ui';
import { useCartStore } from '../store/use-cart-store';
import { X, Plus, Minus, Check, ChevronRight } from 'lucide-react';

interface ModifierModalProps {
  product: Product | null;
  onClose: () => void;
}

export function ModifierModal({ product, onClose }: ModifierModalProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Estado de selecciones: mapeo groupId -> array de optionIds
  const [selections, setSelections] = useState<Record<string, string[]>>(() => {
    if (!product?.modifier_groups) return {};
    const initial: Record<string, string[]> = {};
    for (const group of product.modifier_groups) {
      // Pre-seleccionar opciones por defecto
      const defaults = group.options?.filter((o) => o.is_default).map((o) => o.id) || [];
      if (defaults.length > 0) {
        initial[group.id] = defaults;
      }
    }
    return initial;
  });

  // Estado de selecciones anidadas (2do nivel): parentOptionId -> groupId -> optionIds
  const [nestedSelections, setNestedSelections] = useState<Record<string, Record<string, string[]>>>({});

  if (!product) return null;

  // Manejar selección de opción de 1er nivel
  const handleToggleOption = (group: ModifierGroup, option: ModifierOption) => {
    setSelections((prev) => {
      const current = prev[group.id] || [];
      const isSelected = current.includes(option.id);

      if (group.max_selections === 1) {
        // Radio behavior
        return { ...prev, [group.id]: [option.id] };
      } else {
        // Checkbox behavior
        if (isSelected) {
          return { ...prev, [group.id]: current.filter((id) => id !== option.id) };
        } else {
          if (current.length >= group.max_selections) return prev;
          return { ...prev, [group.id]: [...current, option.id] };
        }
      }
    });

    // Inicializar defaults de grupos anidados si la opción los tiene
    if (option.nested_groups && option.nested_groups.length > 0) {
      setNestedSelections((prev) => {
        const optionNested: Record<string, string[]> = {};
        for (const ng of option.nested_groups || []) {
          const defaults = ng.options?.filter((o) => o.is_default).map((o) => o.id) || [];
          if (defaults.length > 0) optionNested[ng.id] = defaults;
        }
        return { ...prev, [option.id]: optionNested };
      });
    }
  };

  // Manejar selección de opción anidada (2do nivel)
  const handleToggleNestedOption = (
    parentOptionId: string,
    nestedGroup: ModifierGroup,
    nestedOption: ModifierOption
  ) => {
    setNestedSelections((prev) => {
      const currentParent = prev[parentOptionId] || {};
      const currentGroup = currentParent[nestedGroup.id] || [];

      if (nestedGroup.max_selections === 1) {
        return {
          ...prev,
          [parentOptionId]: {
            ...currentParent,
            [nestedGroup.id]: [nestedOption.id],
          },
        };
      } else {
        const isSelected = currentGroup.includes(nestedOption.id);
        const updated = isSelected
          ? currentGroup.filter((id) => id !== nestedOption.id)
          : currentGroup.length < nestedGroup.max_selections
          ? [...currentGroup, nestedOption.id]
          : currentGroup;
        return {
          ...prev,
          [parentOptionId]: {
            ...currentParent,
            [nestedGroup.id]: updated,
          },
        };
      }
    });
  };

  // Validar si los requerimientos mínimos de los grupos se han cumplido
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!product.modifier_groups) return errors;

    for (const group of product.modifier_groups) {
      const selectedCount = (selections[group.id] || []).length;
      if (selectedCount < group.min_selections) {
        errors.push(`Debes seleccionar al menos ${group.min_selections} opción en "${group.name}".`);
      }

      // Validar subniveles anidados activos
      const selectedOptionIds = selections[group.id] || [];
      for (const optId of selectedOptionIds) {
        const option = group.options?.find((o) => o.id === optId);
        if (option?.nested_groups) {
          for (const ng of option.nested_groups) {
            const nestedCount = (nestedSelections[option.id]?.[ng.id] || []).length;
            if (nestedCount < ng.min_selections) {
              errors.push(`Debes seleccionar al menos ${ng.min_selections} opción en "${ng.name}".`);
            }
          }
        }
      }
    }
    return errors;
  }, [product, selections, nestedSelections]);

  // Construir array de modificadores seleccionados y calcular sobreprecio unitario
  const { configuredModifiers, unitPrice } = useMemo(() => {
    const mods: SelectedModifier[] = [];
    let deltaSum = 0;

    if (product.modifier_groups) {
      for (const group of product.modifier_groups) {
        const selectedIds = selections[group.id] || [];
        for (const optId of selectedIds) {
          const option = group.options?.find((o) => o.id === optId);
          if (!option) continue;

          deltaSum += option.price_delta;

          // Procesar modificadores anidados de esta opción
          const nestedMods: SelectedModifier[] = [];
          if (option.nested_groups) {
            for (const ng of option.nested_groups) {
              const nestedSelectedIds = nestedSelections[option.id]?.[ng.id] || [];
              for (const nOptId of nestedSelectedIds) {
                const nOption = ng.options?.find((o) => o.id === nOptId);
                if (!nOption) continue;
                deltaSum += nOption.price_delta;
                nestedMods.push({
                  modifier_group_id: ng.id,
                  modifier_group_name: ng.name,
                  modifier_option_id: nOption.id,
                  modifier_option_name: nOption.name,
                  price_delta: nOption.price_delta,
                });
              }
            }
          }

          mods.push({
            modifier_group_id: group.id,
            modifier_group_name: group.name,
            modifier_option_id: option.id,
            modifier_option_name: option.name,
            price_delta: option.price_delta,
            nested_selections: nestedMods.length > 0 ? nestedMods : undefined,
          });
        }
      }
    }

    return {
      configuredModifiers: mods,
      unitPrice: product.base_price + deltaSum,
    };
  }, [product, selections, nestedSelections]);

  const handleAddToCart = () => {
    if (validationErrors.length > 0) return;

    const cartItem: CartItem = {
      product_id: product.id,
      name: product.name,
      base_price: product.base_price,
      tax_rate: product.tax_rate,
      quantity,
      selected_modifiers: configuredModifiers,
      special_instructions: specialInstructions.trim() || undefined,
    };

    addItem(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Cabecera modal */}
        <div className="relative border-b border-zinc-100 dark:border-zinc-800 p-5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">{product.name}</h2>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              Base: {formatCurrency(product.base_price)} <span className="text-xs text-zinc-400 font-normal">(+ IVA en checkout)</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo con scroll de grupos y modificadores */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {product.description && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Grupos de modificadores */}
          {product.modifier_groups?.map((group) => {
            const currentSelected = selections[group.id] || [];
            const isMandatory = group.min_selections > 0;

            return (
              <div key={group.id} className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 bg-zinc-50/50 dark:bg-zinc-800/30">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      {group.name}
                      {isMandatory && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full">
                          Obligatorio
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {group.max_selections === 1 ? 'Elige 1 opción' : `Hasta ${group.max_selections} opciones`}
                    </p>
                  </div>
                </div>

                {/* Lista de opciones del grupo */}
                <div className="space-y-2">
                  {group.options?.map((option) => {
                    const isSelected = currentSelected.includes(option.id);
                    const hasNested = option.nested_groups && option.nested_groups.length > 0;

                    return (
                      <div key={option.id} className="space-y-2">
                        <div
                          onClick={() => handleToggleOption(group, option)}
                          className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-100'
                              : 'border-zinc-200 dark:border-zinc-700/60 hover:border-zinc-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                                isSelected
                                  ? 'border-emerald-600 bg-emerald-600 text-white'
                                  : 'border-zinc-300 dark:border-zinc-600'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="text-sm font-medium">{option.name}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {option.price_delta > 0 && (
                              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                                +{formatCurrency(option.price_delta)}
                              </span>
                            )}
                            {hasNested && isSelected && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                                Subopciones
                              </span>
                            )}
                          </div>
                        </div>

                        {/* RENDERIZADO DE MODIFICADORES ANIDADOS (2DO NIVEL) */}
                        {hasNested && isSelected && (
                          <div className="ml-6 pl-4 border-l-2 border-emerald-300 dark:border-emerald-700 py-2 space-y-3 animate-in fade-in slide-in-from-top-2">
                            {option.nested_groups?.map((ng) => {
                              const currentNestedSelected = nestedSelections[option.id]?.[ng.id] || [];
                              return (
                                <div key={ng.id} className="space-y-2">
                                  <div className="flex items-center gap-1.5">
                                    <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
                                    <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                      {ng.name}
                                    </h4>
                                    {ng.min_selections > 0 && (
                                      <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300">
                                        (Requerido)
                                      </span>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                    {ng.options?.map((nOption) => {
                                      const isNSelected = currentNestedSelected.includes(nOption.id);
                                      return (
                                        <div
                                          key={nOption.id}
                                          onClick={() => handleToggleNestedOption(option.id, ng, nOption)}
                                          className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                                            isNSelected
                                              ? 'border-emerald-500 bg-emerald-100/50 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 font-semibold'
                                              : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700/50'
                                          }`}
                                        >
                                          <span>{nOption.name}</span>
                                          {nOption.price_delta > 0 && (
                                            <span className="text-[10px] text-zinc-500">
                                              +{formatCurrency(nOption.price_delta)}
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Instrucciones especiales */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Instrucciones especiales para cocina
            </label>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Ej: Sin cebolla, aderezo aparte..."
              className="w-full text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 p-3 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Pie modal: Cantidad y botón de agregar */}
        <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold text-base w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={validationErrors.length > 0}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all"
          >
            <span>Agregar al pedido</span>
            <span>•</span>
            <span>{formatCurrency(unitPrice * quantity)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
