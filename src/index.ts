// @ts-ignore
import Module from "./librw";

function UTF8ToString(array: Uint8Array) {
  let length = 0; while (length < array.length && array[length]) length++;
  return new TextDecoder().decode(array.subarray(0, length));
}

let M: any = null;

export class CObject {
  private p: number | null;
  constructor(ptr: number) {
    if (ptr) {
      this.p = ptr;
    } else {
      throw new Error("cannot construct NULL object");
    }
  }
  get ptr() {
    if (this.p) {
      return this.p;
    } else {
      throw new Error("use after free");
    }
  }
  is(other: CObject) {
    return this.ptr === other.ptr;
  }
  delete() {
    delete this.p;
  }
  static string(ptr: number) {
    let view = M.HEAPU8.subarray(ptr);
    return UTF8ToString(view);
  }
  static uint8Array(ptr: number, length: number): Uint8Array | null {
    if (!ptr) return null;
    return M.HEAPU8.subarray(ptr, ptr + length);
  }
  static uint16Array(ptr: number, length: number): Uint16Array | null {
    if (!ptr) return null;
    let i = ptr / 2;
    return M.HEAPU16.subarray(i, i + length);
  }
  static float32Array(ptr: number, length: number): Float32Array | null {
    if (!ptr) return null;
    let i = ptr / 4;
    return M.HEAPF32.subarray(i, i + length);
  }
}

export enum Platform {
  PLATFORM_NULL = 0,
  PLATFORM_GL   = 2,
  PLATFORM_PS2  = 4,
  PLATFORM_XBOX = 5,
  PLATFORM_D3D8 = 8,
  PLATFORM_D3D9 = 9,
}

export enum PluginID {
  // Core
  ID_NAOBJECT      = 0x00,
  ID_STRUCT        = 0x01,
  ID_STRING        = 0x02,
  ID_EXTENSION     = 0x03,
  ID_CAMERA        = 0x05,
  ID_TEXTURE       = 0x06,
  ID_MATERIAL      = 0x07,
  ID_MATLIST       = 0x08,
  ID_WORLD         = 0x0B,
  ID_MATRIX        = 0x0D,
  ID_FRAMELIST     = 0x0E,
  ID_GEOMETRY      = 0x0F,
  ID_CLUMP         = 0x10,
  ID_LIGHT         = 0x12,
  ID_ATOMIC        = 0x14,
  ID_TEXTURENATIVE = 0x15,
  ID_TEXDICTIONARY = 0x16,
  ID_IMAGE         = 0x18,
  ID_GEOMETRYLIST  = 0x1A,
  ID_ANIMANIMATION = 0x1B,
  ID_RIGHTTORENDER = 0x1F,
  ID_UVANIMDICT    = 0x2B,

  // Toolkit
  ID_SKYMIPMAP     = 0x110,
  ID_SKIN          = 0x116,
  ID_HANIM         = 0x11E,
  ID_USERDATA      = 0x11F,
  ID_MATFX         = 0x120,
  ID_PDS           = 0x131,
  ID_ADC           = 0x134,
  ID_UVANIMATION   = 0x135,

  // World
  ID_MESH          = 0x50E,
  ID_NATIVEDATA    = 0x510,
  ID_VERTEXFMT     = 0x511,

  // custom native raster
  ID_RASTERGL      = 0xA02,
  ID_RASTERPS2     = 0xA04,
  ID_RASTERXBOX    = 0xA05,
  ID_RASTERD3D8    = 0xA08,
  ID_RASTERD3D9    = 0xA09,
  ID_RASTERWDGL    = 0xA0B,
  ID_RASTERGL3     = 0xA0C,

  // anything driver/device related (only as allocation tag)
  ID_DRIVER        = 0xB00
}

export class Stream extends CObject {}

export class StreamMemory extends Stream {
  private data: number | null;
  constructor(buf: Uint8Array) {
    super(M._rw_StreamMemory_new());
    const size = buf.byteLength;
    this.data = M._malloc(size);
    M.HEAPU8.set(buf, this.data);
    M._rw_StreamMemory_open(this.ptr, this.data, size);
  }
  delete() {
    M._rw_StreamMemory_close(this.ptr);
    M._free(this.data);
    this.data = null;
    M._rw_StreamMemory_delete(this.ptr);
    super.delete();
  }
}

export class ChunkHeaderInfo extends CObject {
  constructor(stream: Stream) {
    super(M._rw_ChunkHeaderInfo_new());
    if (!M._rw_readChunkHeaderInfo(stream.ptr, this.ptr)) {
      throw new Error("rw::readChunkHeaderInfo failed");
    }
  }
  get type(): PluginID {
    return M._rw_ChunkHeaderInfo_type(this.ptr);
  }
  delete() {
    M._rw_ChunkHeaderInfo_delete(this.ptr);
    super.delete();
  }
}

export class TexDictionary extends CObject {
  constructor(stream: Stream) {
    super(M._rw_TexDictionary_streamRead(stream.ptr));
  }
  setCurrent() {
    M._rw_TexDictionary_setCurrent(this.ptr);
  }
  get textures() {
    return new LinkList(M._rw_TexDictionary_textures(this.ptr));
  }
  delete() {
    M._rw_TexDictionary_destroy(this.ptr);
    super.delete();
  }
}

export class LinkList extends CObject {
  get begin() {
    return this.end.next;
  }
  get end() {
    return new LLLink(M._rw_LinkList_end(this.ptr));
  }
}

export class LLLink extends CObject {
  get next() {
    return new LLLink(M._rw_LLLink_next(this.ptr));
  }
}

enum FilterMode {
  NEAREST = 1,
  LINEAR,
  MIPNEAREST,
  MIPLINEAR,
  LINEARMIPNEAREST,
  LINEARMIPLINEAR
}
enum Addressing {
  WRAP = 1,
  MIRROR,
  CLAMP,
  BORDER
}

export class Texture extends CObject {
  static readonly FilterMode = FilterMode;
  static readonly Addressing = Addressing;
  static fromDict(lnk: LLLink) {
    return new Texture(M._rw_Texture_fromDict(lnk.ptr));
  }
  static setCreateDummies(b: boolean) {
    M._rw_Texture_setCreateDummies(b ? 1 : 0);
  }
  static setLoadTextures(b: boolean) {
    M._rw_Texture_setLoadTextures(b ? 1 : 0);
  }
  get name() {
    return CObject.string(M._rw_Texture_name(this.ptr));
  }
  get raster() {
    return new Raster(M._rw_Texture_raster(this.ptr));
  }
  get filter(): FilterMode {
    return M._rw_Texture_getFilter(this.ptr);
  }
  get addressU(): Addressing {
    return M._rw_Texture_getAddressU(this.ptr);
  }
  get addressV(): Addressing {
    return M._rw_Texture_getAddressV(this.ptr);
  }
}

enum Format {
  DEFAULT    = 0,
  C1555      = 0x0100,
  C565       = 0x0200,
  C4444      = 0x0300,
  LUM8       = 0x0400,
  C8888      = 0x0500,
  C888       = 0x0600,
  D16        = 0x0700,
  D24        = 0x0800,
  D32        = 0x0900,
  C555       = 0x0A00,
  AUTOMIPMAP = 0x1000,
  PAL8       = 0x2000,
  PAL4       = 0x4000,
  MIPMAP     = 0x8000
}

export class Raster extends CObject {
  static readonly Format = Format;
  static formatHasAlpha(f: Format) {
    return M._rw_Raster_formatHasAlpha(f) !== 0;
  }
  get format(): Format {
    return M._rw_Raster_format(this.ptr);
  }
  toImage() {
    return new Image(M._rw_Raster_toImage(this.ptr));
  }
}

export class Image extends CObject {
  get bpp(): number {
    return M._rw_Image_bpp(this.ptr);
  }
  get depth(): number {
    return M._rw_Image_depth(this.ptr);
  }
  get width(): number {
    return M._rw_Image_width(this.ptr);
  }
  get height(): number {
    return M._rw_Image_height(this.ptr);
  }
  get pixels() {
    return CObject.uint8Array(M._rw_Image_pixels(this.ptr),
      this.bpp * this.width * this.height);
  }
  hasAlpha() {
    return M._rw_Image_hasAlpha(this.ptr) !== 0;
  }
  unindex() {
    M._rw_Image_unindex(this.ptr);
  }
  delete() {
    M._rw_Image_destroy(this.ptr);
    super.delete();
  }
}

export class UVAnimDictionary extends CObject {
  static streamRead(stream: Stream) {
    return new UVAnimDictionary(M._rw_UVAnimDictionary_streamRead(stream.ptr));
  }
  static set current(d: UVAnimDictionary) {
    let p = (d === null) ? 0 : d.ptr;
    M._rw_currentUVAnimDictionary_set(p);
  }
}

export class Clump extends CObject {
  static streamRead(stream: Stream) {
    return new Clump(M._rw_Clump_streamRead(stream.ptr));
  }
  get atomics() {
    return new LinkList(M._rw_Clump_atomics(this.ptr));
  }
  get frame() {
    return new Frame(M._rw_Clump_getFrame(this.ptr));
  }
  delete() {
    M._rw_Clump_destroy(this.ptr);
    super.delete();
  }
}

export class Atomic extends CObject {
  static fromClump(lnk: LLLink) {
    return new Atomic(M._rw_Atomic_fromClump(lnk.ptr));
  }
  get frame() {
    return new Frame(M._rw_Atomic_getFrame(this.ptr));
  }
  get geometry() {
    return new Geometry(M._rw_Atomic_geometry(this.ptr));
  }
}

export class Frame extends CObject {
  get name() {
    return CObject.string(M._gta_getNodeName(this.ptr));
  }
}

export class Geometry extends CObject {
  get numVertices(): number {
    return M._rw_Geometry_numVertices(this.ptr);
  }
  get numTexCoordSets(): number {
    return M._rw_Geometry_numTexCoordSets(this.ptr);
  }
  get colors() {
    return CObject.uint8Array(M._rw_Geometry_colors(this.ptr), 4 * this.numVertices);
  }
  get meshHeader() {
    return new MeshHeader(M._rw_Geometry_meshHeader(this.ptr));
  }
  morphTarget(i: number) {
    return new MorphTarget(M._rw_Geometry_morphTargets(this.ptr, i));
  }
  texCoords(i: number) {
    return CObject.float32Array(M._rw_Geometry_texCoords(this.ptr, i),
      2 * this.numVertices);
  }
}

export class MorphTarget extends CObject {
  get parent() {
    return new Geometry(M._rw_MorphTarget_parent(this.ptr));
  }
  get vertices() {
    return CObject.float32Array(M._rw_MorphTarget_vertices(this.ptr),
      3 * this.parent.numVertices);
  }
  get normals() {
    return CObject.float32Array(M._rw_MorphTarget_normals(this.ptr),
      3 * this.parent.numVertices);
  }
}

export class MeshHeader extends CObject {
  get numMeshes(): number {
    return M._rw_MeshHeader_numMeshes(this.ptr);
  }
  get tristrip() {
    return (M._rw_MeshHeader_flags(this.ptr) & 1) !== 0;
  }
  mesh(i: number) {
    return new Mesh(M._rw_MeshHeader_getMeshes(this.ptr, i));
  }
}

export class Mesh extends CObject {
  get numIndices() {
    return M._rw_Mesh_numIndices(this.ptr);
  }
  get indices() {
    return CObject.uint16Array(M._rw_Mesh_indices(this.ptr), this.numIndices);
  }
  get material() {
    return new Material(M._rw_Mesh_material(this.ptr));
  }
}

export class Material extends CObject {
  get texture() {
    let p = M._rw_Material_texture(this.ptr);
    if (!p) return null;
    return new Texture(p);
  }
  get color() {
    return CObject.uint8Array(M._rw_Material_color(this.ptr), 4);
  }
  get surfaceProps() {
    return new SurfaceProperties(M._rw_Material_surfaceProps(this.ptr));
  }
}

export class SurfaceProperties extends CObject {
  get ambient(): number {
    return M._rw_SurfaceProperties_ambient(this.ptr);
  }
  get specular(): number {
    return M._rw_SurfaceProperties_specular(this.ptr);
  }
  get diffuse(): number {
    return M._rw_SurfaceProperties_diffuse(this.ptr);
  }
}

interface InitOpt {
  locateFile?(path: string, prefix: string): string;
  loadTextures?: boolean;
  gtaPlugins?: boolean;
  platform?: Platform;
}

export function init(opt: InitOpt) {
  return new Promise(resolve => Module(opt).then((module: any) => {
    M = module;
    if (opt.platform) M._rw_platform_set(opt.platform);
    M._rw_Engine_init();
    if (opt.gtaPlugins) M._gta_attachPlugins();
    M._rw_Engine_open();
    M._rw_Engine_start(0);
    if (opt.loadTextures) Texture.setLoadTextures(opt.loadTextures);
    resolve();
  }));
}
